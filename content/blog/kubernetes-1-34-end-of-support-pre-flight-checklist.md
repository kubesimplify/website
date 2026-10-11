---
title: "Kubernetes 1.34 end of support: a pre-flight checklist for 1.35"
seoTitle: "Kubernetes 1.34 end of support: a pre-flight checklist for 1.35"
seoDescription: "Kubernetes 1.34 is end of life on 27 Oct 2026. A pre-flight checklist for 1.35 and 1.36: cgroup v2, containerd 2.x, APIs, ingress, skew and etcd."
datePublished: 2026-10-11T08:00:00.000Z
slug: kubernetes-1-34-end-of-support-pre-flight-checklist
author: johan-kuylenstierna
cover: /img/blog/kubernetes-1-34-end-of-support-pre-flight-checklist/cover.png
tags: ["kubernetes", "upgrades", "containerd", "devops"]
---

On 27 October 2026, Kubernetes 1.34 reaches end of life. It has been in maintenance mode since 27 August, which already meant CVE fixes only. After the 27th it gets nothing at all.

Unlike the Vogons' demolition notice, this one wasn't hidden in a filing cabinet on Alpha Centauri. The 1.35 release notes spelled out the hard parts back in December. In practice, the minor version bump itself is rarely what hurts. What hurts is everything around it that nobody has looked at since the cluster was built: a node image from 2021, a pinned containerd, an ingress controller that was "temporary".

One more thing before the checklist. Kubernetes 1.35 is itself end of life on **28 February 2027**. Treat 1.35 as a waypoint and 1.36 (supported until 28 June 2027) as the destination. That matters, because 1.36 is where containerd 1.x support ends.

*Originally published on [agency42.se](https://agency42.se/en/articles/kubernetes-1-34-end-of-support-pre-flight-checklist). Commands verified on a kind lab cluster (Kubernetes v1.34.0) on 11 Oct 2026. Drafted with AI assistance; reviewed and approved by Johan Kuylenstierna.*

## Pre-flight 1: know what your nodes actually run

Agent Le'man doesn't trust inventory spreadsheets. He reads `nodeInfo`:

```bash
kubectl get nodes -o custom-columns=NODE:.metadata.name,KUBELET:.status.nodeInfo.kubeletVersion,RUNTIME:.status.nodeInfo.containerRuntimeVersion,KERNEL:.status.nodeInfo.kernelVersion
```

Every row tells you something. `containerd://1.7.x` means a runtime upgrade belongs in the plan. Kubelets more than one minor apart mean someone stopped halfway last time. And a 4.x kernel is a hint for the next check.

On the kind lab cluster used for this article it looks like this:

```text
NODE                KUBELET   RUNTIME              KERNEL
lab-control-plane   v1.34.0   containerd://2.1.3   6.12.94+
```

## Pre-flight 2: cgroup v2 on every Linux node

On each node:

```bash
stat -fc %T /sys/fs/cgroup/
```

`cgroup2fs` means cgroup v2. `tmpfs` means cgroup v1. On the lab node:

```text
$ stat -fc %T /sys/fs/cgroup/
cgroup2fs
```

cgroup v1 is deprecated as of 1.35, and the kubelet's `failCgroupV1` setting now defaults to `true`. With default config, a 1.35 kubelet **will not start** on a cgroup v1 node. You can set `failCgroupV1: false` in the kubelet config to buy time, but it is a temporary escape hatch and full removal follows the deprecation policy. kubeadm is stricter still: its `SystemVerification` preflight check errors out on cgroup v1 during `init`, `join` and `upgrade` with a 1.35 kubelet.

Moving to cgroup v2 needs kernel 5.8 or later and usually a newer OS image. Also check the software that reads cgroups directly. Old JVMs, Node.js before 20.3.0 and standalone cAdvisor before v0.43.0 can misread memory limits under v2. The upstream cgroup v2 page has the version list.

## Pre-flight 3: containerd 2.x before you go past 1.35

SIG Node designated 1.35 as the last Kubernetes release to support containerd 1.x. containerd 1.7 has also reached its own end of life (30 September 2026), so it no longer gets patches either.

To see which nodes are affected, look for the `kubelet_cri_losing_support` metric. Alert on it existing at all, not on a specific version label:

```bash
kubectl get --raw "/api/v1/nodes/<node>/proxy/metrics" | grep kubelet_cri_losing_support
```

On a containerd 2.x node this returns nothing (grep exits 1). Empty output is the result you want.

According to containerd's Kubernetes support matrix, Kubernetes 1.35 is tested with containerd 2.2.0+, 2.1.5+ and 1.7.28+, and 1.36 with 2.3.0+ and 2.2.0+. Note that containerd 2.2 goes end of life on 6 November 2026, while 2.3 is an LTS release supported until April 2028. If you're touching containerd anyway, 2.3 is the longer-lived target.

Things that bite during the containerd 2 move:

- **Config.** Old `config.toml` files are migrated automatically on startup. `containerd config migrate` writes the new format, but don't commit to it until you're sure you won't roll back.
- **Removed features.** CRI v1alpha2, the AUFS snapshotter and the runc v1 shims are gone. Pulling Docker Schema 1 images is disabled by default.
- **A free warning list.** On containerd 1.7.12 and later, `ctr deprecations list` tells you what the node uses that 2.x will complain about. Run it before the upgrade, not after.

One more trap: a 1.36 or 1.37 kubelet will still *boot* on containerd 1.7, because the kubelet falls back to its own cgroup driver setting. That fallback is scheduled for removal in 1.38. "It still boots" is not the same as "supported".

## Pre-flight 4: deprecated APIs, mostly the ones you didn't write

Good news: the official deprecated API migration guide lists no built-in API removals after 1.32. For a 1.34 → 1.35 → 1.36 path, the risk sits in CRDs, operators and old Helm charts.

The API server tells you who is still calling deprecated APIs:

```bash
kubectl get --raw /metrics | prom2json | jq '.[] | select(.name=="apiserver_requested_deprecated_apis").metrics[].labels'
```

On a fresh 1.34 lab cluster with nothing but Calico installed, it already found something:

```json
{
  "group": "",
  "removed_release": "",
  "resource": "endpoints",
  "subresource": "",
  "version": "v1"
}
```

That's core `v1` Endpoints, deprecated since 1.33 in favour of EndpointSlices. No removal release is set, so it isn't an upgrade blocker, but it shows how the metric works: some client in your cluster is still calling it, and the metric tells you before a removal does. This covers only the API server instance you hit and only since its last restart, so check every instance and let it run for a while. For manifests and Helm releases, [Pluto](https://github.com/FairwindsOps/pluto) is actively maintained. [kubent](https://github.com/doitintl/kube-no-trouble) still works, but its last release was in 2024, so its rules may lag.

## Pre-flight 5: kube-proxy, ingress and the rest of the add-ons

**kube-proxy in ipvs mode** is deprecated as of 1.35. It is scheduled to be disabled by default in 1.40 and removed in 1.43, so this isn't a fire, but start testing `nftables` mode now (it needs kernel 5.13+). On kubeadm clusters:

```bash
kubectl -n kube-system get cm kube-proxy -o jsonpath='{.data.config\.conf}' | grep '^mode'
```

**Ingress NGINX** (the Kubernetes community controller) was retired in March 2026. The repository is archived and the last release was controller-v1.15.1. It keeps working, but nobody will patch the next CVE. Check whether you run it:

```bash
kubectl get pods --all-namespaces --selector app.kubernetes.io/name=ingress-nginx
```

If you do, Gateway API is the recommended path and [Ingress2Gateway](https://github.com/kubernetes-sigs/ingress2gateway) will convert most of your Ingress objects for you.

Then go through the rest of the list: CNI, CSI drivers, cert-manager, service mesh, monitoring agents. Each has a compatibility matrix, and the target Kubernetes version should be in it before you start.

## Pre-flight 6: PodDisruptionBudgets that block drains

A PDB with zero allowed disruptions will hang `kubectl drain` indefinitely, usually at 23:40 on a Friday:

```bash
kubectl get pdb -A -o custom-columns=NS:.metadata.namespace,NAME:.metadata.name,ALLOWED:.status.disruptionsAllowed
```

Fix the zeros (single replicas, `minAvailable: 100%`) before the maintenance window, not during it.

## Managed and distribution clusters

On managed Kubernetes, the upstream date isn't your deadline. Your vendor's is.

| Platform | 1.34 standard support ends | Extended support |
|---|---|---|
| Amazon EKS | 2 Dec 2026 | until 2 Dec 2027, at extra cost |
| Azure AKS | Nov 2026 | LTS until Nov 2027, if you enable it |
| Google GKE | 25 Jan 2027 | until 25 Nov 2027 |
| RKE2 (SUSE) | maintenance ended 27 Aug 2026 | EOL 27 Feb 2027 |

Extended support is a bridge, not a destination. The cgroup, containerd and ingress work above still has to happen. It just happens later, and you pay for the wait.

**OpenShift** 4.21 is built on Kubernetes 1.34 and uses CRI-O, so the containerd section doesn't apply. cgroup v1 has been gone since OpenShift 4.19, and Red Hat's lifecycle policy (including EUS on even-numbered releases) sets your calendar. **RKE2** bundles its own containerd: v1.34.12+rke2r1 already ships containerd 2.2.7, so check the bundled versions in the release notes rather than the host packages.

## Upgrade order: the skew policy is the map

The version skew policy sets the order:

1. **kube-apiserver** first. In HA setups, all instances must stay within one minor version of each other.
2. **kube-controller-manager, kube-scheduler, cloud-controller-manager** next. They must never be newer than the API server.
3. **kubelets**, node by node: drain, upgrade, uncordon. A kubelet must never be newer than the API server, and may be up to three minors older.
4. **kube-proxy** last, under the same rule.

The control plane moves one minor at a time. kubeadm doesn't support skipping minor versions, so 1.34 → 1.36 means two upgrades. Upstream recommends going to the latest patch of your current minor first, then to the latest patch of the target. On kubeadm with `pkgs.k8s.io`, the package repository is per minor version, so switch the repo before `kubeadm upgrade plan`. And upgrade the CNI by hand. kubeadm won't do it for you.

## Backup and rollback: be honest about "rollback"

Kubernetes doesn't really do in-place minor downgrades. In practice, rollback means a restore. So take a snapshot you have actually tested:

```bash
sudo mkdir -p /var/backups
sudo etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /var/backups/etcd-pre-1.35.db

sudo etcdutl --write-out=table snapshot status /var/backups/etcd-pre-1.35.db

# "Tested" means restored: restore into a scratch dir and check it opens
sudo etcdutl snapshot restore /var/backups/etcd-pre-1.35.db --data-dir /tmp/etcd-restore-test
```

![etcd snapshot save and status on the lab cluster](/img/blog/kubernetes-1-34-end-of-support-pre-flight-checklist/etcd-snapshot.png)

The status check on the lab snapshot:

```text
+----------+----------+------------+------------+---------+
|   HASH   | REVISION | TOTAL KEYS | TOTAL SIZE | VERSION |
+----------+----------+------------+------------+---------+
| 13f43fbd |     1636 |        457 |     6.1 MB |   3.6.0 |
+----------+----------+------------+------------+---------+
```

`ETCDCTL_API=3` is no longer needed: v3 has been the default since etcd 3.4, and etcdctl 3.6 warns `unrecognized environment variable` if you set it.

kubeadm also writes etcd and manifest backups to `/etc/kubernetes/tmp` during an upgrade. That's a nice extra, but it's not a backup strategy. If your etcd is still on 3.5, move every member to 3.5.26 or later before going to 3.6 to avoid the zombie-member bug. On EKS, an in-place upgrade can be rolled back within 7 days. Elsewhere, staging is your rollback rehearsal.

And if you're in NIS2 scope, "we ran an unsupported Kubernetes version" is not a sentence you want in an incident report.

## The copy-paste checklist

```text
[ ] Inventory: kubelet, runtime and kernel version per node
[ ] cgroup v2 on every Linux node (stat -fc %T /sys/fs/cgroup/ = cgroup2fs)
[ ] cgroup-aware app versions (JVM, Node.js >= 20.3.0, cAdvisor >= 0.43.0)
[ ] containerd 2.x planned before 1.36 (2.3 LTS recommended); ctr deprecations list run
[ ] kubelet_cri_losing_support absent on all nodes
[ ] Deprecated API calls checked (apiserver metric + Pluto on manifests/Helm)
[ ] kube-proxy mode known; nftables tested if you're on ipvs
[ ] Ingress NGINX found and migration planned (Gateway API / Ingress2Gateway)
[ ] CNI, CSI, cert-manager, mesh, agents: target version in their compatibility matrix
[ ] PDBs with 0 allowed disruptions fixed
[ ] Vendor support dates checked (EKS/AKS/GKE/OpenShift/RKE2)
[ ] etcd snapshot taken AND test-restored
[ ] Staging upgraded first; control plane -> nodes, one minor at a time
[ ] Plan 1.35 -> 1.36 before 28 Feb 2027
```

Don't panic. Under three weeks is plenty, if you start today. More checklists live at [github.com/Agency-42/kubernetes-best-practices](https://github.com/Agency-42/kubernetes-best-practices), and if you'd rather not do this alone, Agency 42 can help with [Kubernetes operations and upgrades](https://agency42.se/en/kubernetes).

## Sources

- Kubernetes patch releases and EOL dates: https://kubernetes.io/releases/patch-releases/
- Kubernetes v1.35 release blog (cgroup v1, containerd 1.x, ipvs, Ingress NGINX): https://kubernetes.io/blog/2025/12/17/kubernetes-v1-35-release/
- Kubernetes v1.35 sneak peek (containerd 1.x final call): https://kubernetes.io/blog/2025/11/26/kubernetes-v1-35-sneak-peek/
- Cgroup driver autoconfiguration GA and containerd 1.y timeline: https://kubernetes.io/blog/2025/09/12/kubernetes-v1-34-cri-cgroup-driver-lookup-now-ga/
- About cgroup v2 (stat check, failCgroupV1, app versions): https://kubernetes.io/docs/concepts/architecture/cgroups/
- The shift to cgroup v2 (kubeadm preflight, 1.38 fallback): https://kubernetes.io/blog/2026/10/06/kubernetes-cgroups-v2-shift/
- Container runtimes (1.38 fallback removal): https://kubernetes.io/docs/setup/production-environment/container-runtimes/
- containerd releases and Kubernetes support matrix: https://github.com/containerd/containerd/blob/main/RELEASES.md
- containerd 2.0 changes: https://github.com/containerd/containerd/blob/main/docs/containerd-2.0.md
- Deprecated API migration guide: https://kubernetes.io/docs/reference/using-api/deprecation-guide/
- Deprecated API metric: https://kubernetes.io/blog/2020/09/03/warnings/
- kube-proxy modes (ipvs timeline, nftables): https://kubernetes.io/docs/reference/networking/virtual-ips/
- Ingress NGINX retirement: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
- Version skew policy: https://kubernetes.io/releases/version-skew-policy/
- Upgrading kubeadm clusters: https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/
- Operating etcd (snapshot and verify): https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/
- etcd v3.6 zombie members: https://kubernetes.io/blog/2025/12/21/preventing-etcd-zombies/
- Amazon EKS version calendar: https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html
- AKS supported versions: https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions
- GKE release schedule: https://cloud.google.com/kubernetes-engine/docs/release-schedule
- OpenShift 4.21 release notes: https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/release_notes/ocp-4-21-release-notes
- OpenShift 4.19 release notes (cgroup v1 removed): https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html-single/release_notes/
- SUSE product lifecycle (RKE2): https://www.suse.com/lifecycle/
- RKE2 v1.34 support matrix: https://www.suse.com/suse-rke2/support-matrix/all-supported-versions/rke2-v1-34/
