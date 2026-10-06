---
title: "Give each customer their own GPU with KubeVirt on Kubernetes"
seoTitle: "Give each customer their own GPU with KubeVirt on Kubernetes"
seoDescription: "A runbook for passing one NVIDIA L4 through to a KubeVirt VM on any Kubernetes cluster: vfio-pci binding, the KubeVirt allowlist, the VM manifest, and the driver and container toolkit inside the guest."
datePublished: 2026-10-06T10:00:00.000Z
slug: give-each-customer-their-own-gpu-with-kubevirt
author: shubham-katara
tags: ["kubevirt", "kubernetes", "gpu", "nvidia", "platform-engineering"]
---

A platform team with a GPU server usually does the obvious thing. They install the NVIDIA driver on the host, point Kubernetes at the cards, and let every workload in the cluster share them. That works until two customers need two different environments, and neither should see the other's processes, drivers or CUDA stack.

The answer is a virtual machine per card. KubeVirt passes the PCI device through, the guest owns the NVIDIA driver and its own Kubernetes cluster, and the host cluster only ever sees a VM.

Let's build that on a real machine, with every script we ran.

## What this post covers

This is a runbook. Eight steps, from a bare Ubuntu host to an Ubuntu VM that owns one physical GPU, runs its own Kubernetes with the NVIDIA GPU Operator, and splits that one card into ten schedulable GPUs with HAMi.

Every install step here comes from a set of scripts we ran in order, and the checks are the commands we used to verify each one. The host needs no NVIDIA driver for this passthrough, and Step 2 explains why. Nothing here depends on a particular Kubernetes distribution.

Who this is for:

- Platform engineers who own GPU hardware and are asked to "just share the cards" across teams.
- People running a small Kubernetes cluster who need stronger isolation than a shared device plugin.

## The machine

- Ubuntu 24.04 on bare metal, with an AMD EPYC 7452
- Two NVIDIA L4 cards, 23 GB each
- Kubernetes, on this machine as a node, with `kubectl` pointed at it. Any distribution works. We used a single-node RKE2.
- KubeVirt v1.9.0
- Inside the VM: RKE2 v1.36.4, NVIDIA GPU Operator v26.3.2 and HAMi v2.10.0

You need root on the GPU node for the first two steps. After that the work runs from anywhere with `kubectl`, and from inside the VM.

Both cards are NVIDIA L4s. `lspci` shows them:

```text
01:00.0 3D controller: NVIDIA Corporation AD104GL [L4] [10de:27b8]
41:00.0 3D controller: NVIDIA Corporation AD104GL [L4] [10de:27b8]
```

`10de:27b8` is the L4's PCI ID. Every later step, the KubeVirt allowlist in particular, has to use the ID your machine actually reports, so write it down before you write a manifest.

The two cards sit at `0000:01:00.0` and `0000:41:00.0`. We pass the second one through.

## The shape we are building

A PCI function is owned by exactly one driver at a time. KubeVirt can only hand a function to a VM when that driver is `vfio-pci`.

```text
bare metal, AMD-V + AMD-Vi
┌──────────────────────────────────────────────┐
│  L4  0000:41:00.0  vfio-pci                  │
│                                              │
│  Kubernetes                                  │
│    KubeVirt                                  │
│      permittedHostDevices  10DE:27B8         │
└─────────────────────────────┬────────────────┘
                              │ PCI passthrough
                              ▼
                    ┌───────────────────┐
                    │ Ubuntu 24.04 VM   │
                    │ sees one real L4  │
                    │ RKE2              │
                    │ GPU Operator      │
                    │ HAMi: 1 L4 -> 10  │
                    └───────────────────┘
```

The host cluster schedules the VM. It does not run the customer's job. A noisy notebook, a privileged pod or a CUDA upgrade inside the VM stays inside the VM.

## Before you start: Prove the host can do passthrough

KubeVirt needs hardware virtualization, and GPU passthrough additionally needs the IOMMU. On this EPYC box that is AMD-V and AMD-Vi.

```bash
grep -m1 -o svm /proc/cpuinfo
ls -l /dev/kvm
lsmod | grep kvm
dmesg | grep -i AMD-Vi | head
```

You want `svm`, a `/dev/kvm` node, `kvm_amd` in `lsmod` and AMD-Vi lines in `dmesg`.

## Step 1: Have a Kubernetes cluster on the GPU node

KubeVirt runs on top of Kubernetes, so the GPU machine needs to be a node in a cluster. Which distribution you pick does not matter for anything that follows. Every later step only uses `kubectl`.

If you already have a cluster with this machine in it, check that `kubectl` reaches it and move on:

```bash
kubectl get nodes
```

If you have no cluster, any distribution will do. We used a single-node RKE2 server. `optional/rke2.sh` installs it and waits for the node to be `Ready`:

```bash
curl -sfL https://get.rke2.io | INSTALL_RKE2_VERSION="v1.36.4+rke2r1" sh -
systemctl enable --now rke2-server

export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
export PATH="/var/lib/rancher/rke2/bin:${PATH}"
kubectl get nodes
```

RKE2 ships its own `kubectl` and writes its kubeconfig to `/etc/rancher/rke2/rke2.yaml`. On another distribution, the equivalent is whatever kubeconfig that distribution gives you.

## Step 2: Bind one card to vfio-pci

### Why `nvidia` and `vfio-pci` cannot own the same card

A PCI function has one kernel driver bound to it at a time. That driver is the owner: it maps the card's registers and memory, sets up DMA and interrupts, and decides when the card is reset.

The `nvidia` driver is a full GPU driver. It takes the card and uses it itself, so the host kernel is driving the GPU.

`vfio-pci` is the opposite. It does no GPU work. It is a placeholder driver whose only job is to give the device to a user-space program through the IOMMU, which in this case is the QEMU process inside KubeVirt's `virt-launcher` pod. QEMU maps the real device into the VM, and the guest talks to the hardware directly.

Both cannot hold the card at once. If `nvidia` owned it, the host would be driving a device the VM expects to have to itself, and KubeVirt could not hand it over. So the card has to leave `nvidia` and move to `vfio-pci` before the VM starts.

Think of passing a USB stick through to a VM. The host does not need a driver for the stick, because the thing that uses it is the guest. It is the same here. The L4 will be used inside the VM, so the driver that matters lives inside the VM, and the host only has to get out of the way.

### When the host does need the NVIDIA driver

That only holds for whole-card passthrough. Suppose your card supports MIG and you want to cut a slice from it, a MIG-backed vGPU, and give that slice to a VM. Then the host does need the NVIDIA driver, because the host is the one carving the card up, and it does that by talking to the card through NVML. The VM gets a slice, not the card. The L4 has no MIG, so that route does not apply to this machine.

### The bind

Whatever driver owns the card now is unbound first, and then `vfio-pci` takes it.

You bind by PCI address, not by ID. Both L4s share `10de:27b8`, so a module option like `vfio-pci.ids=10de:27b8` would take both cards. If you want one card for a VM and the other left alone, the split has to be by address.

`01-bind-card-to-vfio.sh` does the move, as root on the GPU node:

```bash
PCI_ADDR=0000:41:00.0

apt-get install -y driverctl
printf '%s\n' vfio vfio_iommu_type1 vfio_pci > /etc/modules-load.d/vfio.conf
modprobe vfio
modprobe vfio_iommu_type1
modprobe vfio_pci

echo "${PCI_ADDR}" > "/sys/bus/pci/devices/${PCI_ADDR}/driver/unbind"
echo vfio-pci > "/sys/bus/pci/devices/${PCI_ADDR}/driver_override"
echo "${PCI_ADDR}" > /sys/bus/pci/drivers/vfio-pci/bind

driverctl set-override "${PCI_ADDR}" vfio-pci
```

**Use `driverctl`, not just sysfs.** A `driver_override` written to sysfs is gone after a reboot, and another driver claims the function again. `driverctl set-override` stores the choice per slot. Loading the three `vfio` modules at boot gives that override a driver to bind to.

Confirm the card is bound before you go further:

```bash
lspci -k -s 41:00.0    # Kernel driver in use: vfio-pci
driverctl list-overrides
```

## Step 3: Install KubeVirt and allowlist the L4

KubeVirt here comes from the upstream operator manifest, not a Helm release. `02-kubevirt.sh` applies the operator, waits for it, applies the `KubeVirt` custom resource, and installs CDI, which imports the guest's root disk. It uses whatever cluster your kubeconfig points at, so it is the same on any distribution:

```bash
VERSION=v1.9.0

kubectl apply -f "https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-operator.yaml"
kubectl -n kubevirt rollout status deploy/virt-operator --timeout=300s
kubectl apply -f kubevirt/kubevirt-cr.yaml
kubectl get kubevirt -n kubevirt kubevirt
```

The script also installs the Containerized Data Importer (CDI) from its latest upstream release. CDI downloads the Ubuntu cloud image into a persistent volume, so what you install in the guest survives a pod recreation. It needs a StorageClass in the cluster, the default one or `STORAGE_CLASS`.

The CR is where passthrough is allowed. KubeVirt will not offer any host device until it is on this list:

```yaml
apiVersion: kubevirt.io/v1
kind: KubeVirt
metadata:
  name: kubevirt
  namespace: kubevirt
spec:
  configuration:
    imagePullPolicy: IfNotPresent
    permittedHostDevices:
      pciHostDevices:
        - pciVendorSelector: "10DE:27B8"
          resourceName: nvidia.com/AD104GL_L4
  imagePullPolicy: IfNotPresent
```

The selector matches both L4s, which looks dangerous. It is not. `virt-handler` in v1.9 registers only functions already bound to `vfio-pci` and skips any `10de:27b8` function whose driver is something else. The card you did not bind is never registered.

That is why we leave `externalResourceProvider` unset. You do not need your own device plugin for this layout.

Wait until a node advertises the resource:

```bash
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.allocatable.nvidia\.com/AD104GL_L4}{"\n"}{end}'
```

You want `1` next to the GPU node. If it is empty, the card is not on `vfio-pci` yet, or the CR has not been applied.

## Step 4: Boot a VM that owns the card

`03-ubuntu-vm.sh` creates the VM from the Ubuntu 24.04 cloud image. The guest will run Kubernetes, the GPU Operator and HAMi, so it is sized for that: 8 CPUs, 16 GiB of memory and a 100 GiB disk by default. Override them with `VM_CPU`, `VM_MEMORY` and `DISK_SIZE`.

The GPU stanza is the whole change from a normal KubeVirt VM:

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: testvm
  namespace: tenants
spec:
  runStrategy: Always
  dataVolumeTemplates:
    - metadata:
        name: testvm-root
      spec:
        source:
          http:
            url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
        storage:
          resources:
            requests:
              storage: 100Gi
  template:
    metadata:
      labels:
        kubevirt.io/domain: testvm
    spec:
      architecture: amd64
      domain:
        machine:
          type: q35
        devices:
          disks:
            - disk:
                bus: virtio
              name: rootdisk
            - disk:
                bus: virtio
              name: cloudinitdisk
          gpus:
            - name: gpu1
              deviceName: nvidia.com/AD104GL_L4
          interfaces:
            - masquerade: {}
              name: default
        resources:
          requests:
            cpu: "8"
            memory: 16Gi
      networks:
        - name: default
          pod: {}
      volumes:
        - name: rootdisk
          dataVolume:
            name: testvm-root
        - name: cloudinitdisk
          cloudInitNoCloud:
            secretRef:
              name: testvm-cloud-init
```

The cloud-init user data holds a login password, so it does not sit in the VM manifest. The script puts it in a Secret named `testvm-cloud-init` and the VM points at it with `secretRef`. KubeVirt reads the `userdata` key:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: testvm-cloud-init
  namespace: tenants
stringData:
  userdata: |
    #cloud-config
    ssh_pwauth: true
    chpasswd:
      expire: false
      users:
        - name: ubuntu
          password: <generated>
          type: text
    users:
      - name: ubuntu
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        lock_passwd: false
        ssh_authorized_keys:
          - <your public key>
```

A few lines matter:

- `machine.type: q35`, because the GPU is a PCIe device.
- `gpus[].deviceName` must match the `resourceName` in the KubeVirt CR exactly.
- `namespace` is wherever you want the VM to live. The script defaults to `tenants` and creates it if missing.

The script also publishes SSH through a `NodePort` service on 30022, so you can reach the guest from outside the cluster:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: testvm-ssh
  namespace: tenants
spec:
  type: NodePort
  selector:
    kubevirt.io/domain: testvm
  ports:
    - name: ssh
      port: 22
      targetPort: 22
      nodePort: 30022
```

The script generates a random password and prints it at the end. It reads your key from `SSH_PUBLIC_KEY` or `~/.ssh/id_rsa.pub`, and you can set `VM_PASSWORD` to choose your own password. Set `SSH_PUBLIC_KEY` yourself if the machine has no key to reuse.

Once the VM is up, log in and check that the card arrived:

```bash
ssh -p 30022 -i ~/.ssh/id_rsa ubuntu@<node-ip>
lspci | grep -i nvidia
```

Inside the guest, `lspci` shows an NVIDIA L4. If it shows nothing, fix it on the host: check that `deviceName` matches the advertised resource and that the card is still on `vfio-pci`.

From here on, every command runs inside the VM. Copy the `guest/` folder over, then log in and switch to root with `sudo -i`:

```bash
scp -P 30022 -r guest ubuntu@<node-ip>:
ssh -p 30022 ubuntu@<node-ip>
sudo -i
```

## Step 5: Install RKE2 in the guest

The VM is now an ordinary Ubuntu machine with a GPU. Give it its own Kubernetes. RKE2 is one binary installer that brings `containerd` and `kubectl` with it, so there is nothing else to install first.

Copy the `guest/` folder into the VM, then run `guest/01-rke2.sh` as root:

```bash
curl -sfL https://get.rke2.io | INSTALL_RKE2_VERSION="v1.36.4+rke2r1" sh -
systemctl enable --now rke2-server

export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
export PATH="/var/lib/rancher/rke2/bin:${PATH}"
kubectl get nodes
```

Wait until the node is `Ready`. This cluster belongs to the customer. The host cluster never sees it.

## Step 6: Install the GPU Operator in the guest

A loaded kernel module is not enough for containers. The container runtime has to inject the driver libraries into a container too. The NVIDIA GPU Operator does both jobs. It installs the driver and the NVIDIA Container Toolkit, then registers the `nvidia` runtime with `containerd`.

Install Helm in the VM, then add the chart repository and install version `v26.3.2`. `guest/02-gpu-operator.sh` does all of it:

```bash
helm repo add nvidia https://nvidia.github.io/gpu-operator
helm repo update

helm upgrade --install gpu-operator nvidia/gpu-operator \
  --version v26.3.2 \
  --namespace gpu-operator --create-namespace \
  -f gpu-operator-values.yaml \
  --wait --timeout 20m
```

The values file carries the two settings that matter:

```yaml
devicePlugin:
  enabled: false
toolkit:
  env:
    - name: CONTAINERD_SOCKET
      value: /run/k3s/containerd/containerd.sock
    - name: CONTAINERD_CONFIG
      value: /var/lib/rancher/rke2/agent/etc/containerd/config.toml
    - name: CONTAINERD_RUNTIME_CLASS
      value: nvidia
    - name: CONTAINERD_SET_AS_DEFAULT
      value: 'true'
```

**Why the `toolkit.env` block.** RKE2 keeps its `containerd` socket and config in its own paths, not the usual ones. These variables point the operator's toolkit at them, name the runtime class `nvidia`, and make it the default runtime.

**Why the device plugin is off.** HAMi brings its own device plugin in the next step. Two plugins advertising the same GPU would fight over it.

When it finishes, the operator pods run in `gpu-operator`, and a `RuntimeClass` named `nvidia` exists:

```bash
kubectl -n gpu-operator get pods
kubectl get runtimeclass nvidia
```

The driver lives in a container, not on the VM's own path. To run `nvidia-smi` against it from the VM, go through its root:

```bash
chroot /run/nvidia/driver nvidia-smi -L
```

You want one L4, the card you passed through.

## Step 7: Split the card with HAMi

One L4 is one GPU to Kubernetes. HAMi turns it into many. Its device plugin advertises ten slices of the card, and each pod can ask for a slice of memory and compute.

HAMi only schedules onto nodes labelled `gpu=on`. `guest/03-hami.sh` labels the node, adds the chart repository and installs `2.10.0`:

```bash
kubectl label node --all gpu=on --overwrite

helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update

helm upgrade --install hami hami-charts/hami \
  --version 2.10.0 \
  --namespace hami-system --create-namespace \
  -f hami-values.yaml \
  --wait --timeout 10m
```

The default split count is 10, which is the "ten cards". The values file makes HAMi work with the GPU Operator's driver and toolkit:

```yaml
devicePlugin:
  runtimeType: "containerd"
  runtimeClassName: "nvidia"
  deviceListStrategy: "cdi-annotations"
  extraArgs:
    - "-v=10"
    - "--device-discovery-strategy=nvml"
    - "--cdi-annotation-prefix=cdi.k8s.io/"
  libPath: /usr/local/vgpu
  nvidiaDriverRoot: /run/nvidia/driver
  passDeviceSpecsEnabled: false

  gpuOperatorToolkitReady:
    enabled: true

  tolerations:
    - operator: Exists

  extraEnvs:
    - name: NVIDIA_CTK_PATH
      value: "/usr/local/nvidia/toolkit/nvidia-ctk"
    - name: CDI_SPECS_DIR
      value: "/var/run/cdi"
```

Four lines of it need a reason:

- **`runtimeClassName: "nvidia"`.** The GPU Operator does not set `containerd`'s default runtime name, so HAMi's monitor and its own NVML check need this to get the driver injected by the NVIDIA runtime.
- **`deviceListStrategy: "cdi-annotations"`.** CDI-based injection through the container toolkit needs this exact value. The plain `"cdi"` is not valid.
- **`nvidiaDriverRoot: /run/nvidia/driver`.** The GPU Operator installs the driver under that path, not at the root of the filesystem.
- **`gpuOperatorToolkitReady.enabled: true`.** The HAMi plugin waits for the operator's toolkit before it starts.

## Step 8: Prove it end to end

Three checks tell you the whole stack works. Run them inside the VM.

**The node advertises ten GPUs.**

```bash
kubectl describe node | grep -A6 Allocatable
```

You want `nvidia.com/gpu: 10` in the list, from one physical card.

**The VM still has one physical card.** `nvidia-smi -L` does not show ten devices. It shows the one L4, because HAMi splits the card in Kubernetes, not in the driver:

```bash
chroot /run/nvidia/driver nvidia-smi -L
```

**Two pods each get 1 GiB of it.** `guest/gpu-test-pods.yaml` creates two pods. Each asks for one GPU slice with a memory limit of 1024 MiB:

```yaml
resources:
  limits:
    nvidia.com/gpu: 1
    nvidia.com/gpumem: 1024
```

```bash
kubectl apply -f guest/gpu-test-pods.yaml
kubectl wait --for=condition=Ready pod/gpu-test-1 pod/gpu-test-2 --timeout=300s
kubectl exec gpu-test-1 -- nvidia-smi
kubectl exec gpu-test-2 -- nvidia-smi
```

Each pod's `nvidia-smi` should report a memory total of about 1 GiB, not the 23 GB of the real card. That is HAMi's limit, enforced per pod, and it is how one passed-through card serves several workloads.

That is the stack: a physical card, passed through to a VM by KubeVirt, running a Kubernetes cluster that shares it between pods.

## Errors you will actually hit

### The VM lost its GPU after a reboot of the host

The `driver_override` lived only in sysfs. After a reboot another driver claims the function again and the VM goes dark. Run `lspci -k` first, then `driverctl set-override <addr> vfio-pci`.

### `nvidia.com/AD104GL_L4` is not allocatable

Either no card is bound to `vfio-pci`, or the KubeVirt CR has no `permittedHostDevices` entry. Check both. `03-ubuntu-vm.sh` waits and then exits with this message instead of creating a VM that can never schedule.

### The HAMi pods stay `Pending`

HAMi only schedules onto nodes labelled `gpu=on`. Check the label with `kubectl get nodes --show-labels`.

### `nvidia-smi` is not found in the VM

The driver is installed by the GPU Operator in a container, so it is not on the VM's own path. Use `chroot /run/nvidia/driver nvidia-smi`.

## What this does not do

The host gives each customer a whole card. The splitting happens inside the VM, in software, with HAMi. An L4 has no MIG, so there is no hardware slicing. Carving a MIG-backed vGPU from a card that supports it is a different setup, and it needs the NVIDIA driver on the host. That is a different article.

HAMi slices memory and compute in software. It is a way to share one card between trusted workloads inside one customer's VM. It is not hardware isolation between them, which is what the VM boundary gives you between customers.

A customer VM is also a computer you now operate. It needs disk, backups, an SSH path or console, and an upgrade story. KubeVirt removes the second physical server. It does not remove the second machine to look after.

## Wrapping up

Four things to carry out of this.

**One.** Check the PCI ID your hardware actually reports. The KubeVirt allowlist depends on it.

**Two.** Bind by PCI address and persist it with `driverctl`. An ID-wide option takes every card of that model, and a sysfs-only override disappears on reboot.

**Three.** For whole-card passthrough the host needs no NVIDIA driver. The card goes to `vfio-pci`, and the driver and container toolkit live inside the VM, which is what keeps each customer's stack separate. If you want the host to slice a card instead, the host needs the driver.

**Four.** HAMi's ten GPUs exist in Kubernetes, not in the driver. `nvidia-smi -L` in the VM still shows one card, and each pod's `nvidia-smi` shows its memory limit.

A card you give a customer moves to `vfio-pci` and shows up in one KubeVirt VM with its own driver and its own Kubernetes. The platform team keeps the hardware. The customer gets a machine.

## Credits and references

- KubeVirt host device assignment: [kubevirt.io/user-guide/compute/host-devices](https://kubevirt.io/user-guide/compute/host-devices/)
- NVIDIA GPU Operator: [nvidia.github.io/gpu-operator](https://nvidia.github.io/gpu-operator)
- HAMi: [project-hami.github.io/HAMi](https://project-hami.github.io/HAMi/)
- Containerized Data Importer: [github.com/kubevirt/containerized-data-importer](https://github.com/kubevirt/containerized-data-importer)
- RKE2 documentation: [docs.rke2.io](https://docs.rke2.io/)
