---
title: "A Kubeconfig for GKE That Doesn't Need gcloud"
datePublished: 2026-04-29T05:56:22.335Z
slug: a-kubeconfig-for-gke-that-doesnt-need-gcloud
author: saiyam-pathak
cover: https://cloudmate-test.s3.us-east-1.amazonaws.com/res%2Fhashnode%2Fimage%2Fupload%2Fv1777443605504%2F64d466df-ca7e-4b49-b46d-a2c3177667b6.png
tags: []
cuid: cmojn6ldq000402lh4cq09m5p
---

When you run `gcloud container clusters get-credentials`, the kubeconfig it writes looks innocent — until you hand it to a teammate and they hit:

```
error: exec plugin: invalid apiVersion "client.authentication.k8s.io/v1beta1"
```

…or the classic `gke-gcloud-auth-plugin: executable not found`.

That's because the generated kubeconfig doesn't actually contain a credential. It contains an `exec:` block that shells out to `gke-gcloud-auth-plugin`, which in turn calls `gcloud` to mint a fresh OAuth token on every kubectl call. If you look at the `users` section of a stock GKE kubeconfig, this is what's in there:

```yaml
users:
- name: gke_saiyam-project_us-east1-b_demo-test
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: Install gke-gcloud-auth-plugin for use with kubectl by following
        https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl#install_plugin
      interactiveMode: IfAvailable
      provideClusterInfo: true
```

No token. No cert. Just "run this plugin and ask it for auth." No gcloud on the machine, no access.

If you want a kubeconfig that *anyone* can use — a CI runner, a contractor's laptop, a script on a VM — you need to swap that exec-plugin auth for something self-contained. The cleanest answer: a Kubernetes ServiceAccount and a bearer token.


Here's the full flow, run end-to-end against a live GKE cluster.

## The mental model

Four pieces, in order:

1. **Identity** — a ServiceAccount in the cluster
2. **Permissions** — a (Cluster)RoleBinding attaching a role to that SA
3. **Credential** — a token the SA can present to the API server
4. **Portable config** — a kubeconfig file wrapping the token + cluster endpoint + CA cert

The API server validates the token itself. No Google, no gcloud, no OAuth round-trip.

## Step 1: Identity and permissions

```bash
kubectl create serviceaccount shared-access -n kube-system

kubectl create clusterrolebinding shared-access-binding \
  --clusterrole=cluster-admin \
  --serviceaccount=kube-system:shared-access
```

Output:

```
serviceaccount/shared-access created
clusterrolebinding.rbac.authorization.k8s.io/shared-access-binding created
```

Two things worth calling out:

- The SA lives in `kube-system` because it's a cluster-wide utility identity. The namespace doesn't restrict its access — RBAC does.
- `cluster-admin` is `*` on `*`. Scope it down in production. `view`, `edit`, or a custom ClusterRole are usually what you actually want. If you only need namespace-scoped access, use a `RoleBinding` in that namespace instead of a `ClusterRoleBinding`.

## Step 2: Mint a long-lived token

Before Kubernetes 1.24, creating a ServiceAccount automatically created a companion Secret with a non-expiring token. That was removed — long-lived bearer tokens are a security footgun — so now you opt in explicitly:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: shared-access-token
  namespace: kube-system
  annotations:
    kubernetes.io/service-account.name: shared-access
type: kubernetes.io/service-account-token
EOF
```

Output:

```
secret/shared-access-token created
```

The magic is in two fields:

- **`type: kubernetes.io/service-account-token`** — tells the token controller (built into `kube-controller-manager`) "I'm a Secret you should populate."
- **`kubernetes.io/service-account.name` annotation** — tells it *which* ServiceAccount's identity to embed in the token.

Wait a couple of seconds, then inspect the Secret — the controller has filled in the data for you:

```bash
kubectl get secret shared-access-token -n kube-system -o yaml
```

```yaml
apiVersion: v1
data:
  ca.crt: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVMVENDQXBXZ0F3SUJB...
  namespace: a3ViZS1zeXN0ZW0=
  token: ZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNklrWnNZMkk0VFRkWmFrVjN...
kind: Secret
metadata:
  annotations:
    kubernetes.io/service-account.name: shared-access
    kubernetes.io/service-account.uid: 9e8d4bdb-46ea-4893-9306-d56bea6aa304
  name: shared-access-token
  namespace: kube-system
type: kubernetes.io/service-account-token
```

Three fields got populated by the controller:

- `.data.token` — a signed JWT, the actual bearer credential
- `.data.ca.crt` — the cluster's CA certificate (so your client can trust the API server's TLS)
- `.data.namespace` — the SA's namespace

> If you'd rather have a short-lived token, skip the Secret and run `kubectl create token shared-access -n kube-system --duration=24h`. Good for automation that rotates. Bad for a "hand someone a file" use case, which is what we're doing here.

## Step 3: Extract the three things a kubeconfig needs

```bash
SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
CA=$(kubectl get secret shared-access-token -n kube-system -o jsonpath='{.data.ca\.crt}')
TOKEN=$(kubectl get secret shared-access-token -n kube-system -o jsonpath='{.data.token}' | base64 -d)

echo "SERVER = ${SERVER}"
echo "CA     = ${CA:0:60}..."
echo "TOKEN  = ${TOKEN:0:40}..."
```

Output:

```
SERVER = https://35.196.129.174
CA     = LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0WERQWERk1JSUVMVENDQXBXZ0F3SUJB...
TOKEN  = eyJhbGciOiJSUzIsImtpZCI6IkZsY2I4TTdZ...
```

- `SERVER` — the GKE API endpoint, pulled straight from your current context
- `CA` — already base64, drops straight into the kubeconfig as-is
- `TOKEN` — we decode it because kubeconfig wants the raw JWT string, not base64

## Step 4: Assemble the kubeconfig

```bash
cat > /tmp/shared-kubeconfig.yaml <<EOF
apiVersion: v1
kind: Config
clusters:
- name: cluster-1
  cluster:
    server: ${SERVER}
    certificate-authority-data: ${CA}
contexts:
- name: cluster-1
  context:
    cluster: cluster-1
    user: shared-access
current-context: cluster-1
users:
- name: shared-access
  user:
    token: ${TOKEN}
EOF
```

A kubeconfig is three independent lists — `clusters`, `users`, `contexts` — glued together by a `context` that names one cluster + one user. Nothing more.

Notice what's *not* in the `users` block: no `auth-provider`, no `exec`. kubectl has nothing to shell out to. It just sends `Authorization: Bearer <token>` on every request and the API server validates the JWT.

## Step 5: Prove it works without gcloud

```bash
KUBECONFIG=/tmp/shared-kubeconfig.yaml kubectl get nodes
KUBECONFIG=/tmp/shared-kubeconfig.yaml kubectl auth whoami
KUBECONFIG=/tmp/shared-kubeconfig.yaml kubectl auth can-i '*' '*' --all-namespaces
```

Output:

```
NAME                                       STATUS   ROLES    AGE   VERSION
gke-demo-test-default-pool-a5aaa3f4-jcnk   Ready    <none>   18h   v1.35.1-gke.1396002

ATTRIBUTE   VALUE
Username    system:serviceaccount:kube-system:shared-access
UID         9e8d4bdb-46ea-4893-9306-d56bea6aa304
Groups      [system:serviceaccounts system:serviceaccounts:kube-system system:authenticated]

yes
```

That's the whole proof. The API server sees `system:serviceaccount:kube-system:shared-access`, not your Google identity. You can put this file on a machine that has never seen `gcloud` in its life, and it works.

## Things to know before you ship this

**Private clusters still need network reachability.** The kubeconfig removes the auth dependency, not the network one. If your control plane is private, the recipient still needs VPN, authorized networks, or a public endpoint. The token won't help if they can't reach the API server.

**The kubeconfig is a credential.** Anyone with the file has whatever RBAC you bound. Store it like you'd store an SSH key or an API token. Don't commit it to Git.

**Revocation is deletion.** To kill access, delete the Secret:

```bash
kubectl delete secret shared-access-token -n kube-system
```

To kill it harder, also delete the binding and the SA. There's no "rotate" — you mint a new Secret and redistribute the new kubeconfig.

**Scope down.** `cluster-admin` is the demo default, not the production default. A `RoleBinding` to `edit` in a single namespace is usually closer to what a real sharing use case needs. `ClusterRoleBinding` + `cluster-admin` only when you truly mean it.

## Wrap

The trick isn't really about GKE — it's about understanding what a kubeconfig *is*. Once you see it as a glue file between a cluster endpoint and any credential the API server will accept, the exec-plugin auth stops feeling magical and the bearer-token swap becomes obvious.

Same approach works for EKS (where the plugin is `aws-iam-authenticator` / `aws eks get-token`), AKS (`kubelogin`), and anything else that ships exec-based auth. Replace the `user:` block, keep the `cluster:` block, and you've got a kubeconfig that travels.


![The swap: only the users: block changes](https://cloudmate-test.s3.us-east-1.amazonaws.com/res%2Fhashnode%2Fimage%2Fupload%2Fv1777443629837%2Fe68d717f-9820-48f2-af6c-55be0c211a90.png)

