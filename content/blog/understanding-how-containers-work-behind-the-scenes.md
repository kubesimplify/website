---
title: "Understanding How Containers Work Behind the Scenes"
seoTitle: "How docker works behind the scenes"
datePublished: 2023-04-29T12:30:41.855Z
slug: understanding-how-containers-work-behind-the-scenes
author: anuj-chourasia
cover: /img/blog/understanding-how-containers-work-behind-the-scenes/a432edaa-8dc3-4ea2-8615-6901680d8035.png
tags: ["linux", "docker", "devops", "cgroups"]
cuid: clh1yo2kd069m8knv556u3ufu
---
Containers provide a convenient way to deploy and run applications within their own isolated environment, eliminating the need to create separate virtual machines. However, have you ever questioned the underlying mechanisms that make containers operate seamlessly?

%[https://giphy.com/gifs/kQOxxwjjuTB7O] 

Containers leverage two key features of the Linux kernel which enables better isolation between the processes:

1. Namespaces.
    
2. Control groups (cgroups).
    

When a container is launched, Docker generates a unique set of namespaces and cgroups which are allocated specifically to that container.

> "Containers are like Russian dolls - they have layers upon layers, and when you open them up, you realize they all contain the same thing, just in different sizes!" ~chatgpt

Let's take a closer look at what these namespaces and cgroups are and how can you create one.

## Namespaces and cgroups

### Namespaces

![](/img/blog/understanding-how-containers-work-behind-the-scenes/839696f4-943b-44b3-8ab2-e637ef81f4d7.png align="center")

Namespace is a feature in Linux that lets you see a specific part of the system, meaning allocating resources in an isolated environment. Namespace allows you to create that isolated environment where the container only knows what it can see because it's only in a certain namespace.

When you initialize a container, docker generates a set of namespaces for the container and every container has its own unique set of namespaces.

**There are various types of namespaces with different properties:**

* User/UIDs namespaces - a container running within the user namespace is isolated from the User IDs and Group IDs of other containers, making them unaware of each other's existence.
    
* UTS namespaces - isolate hostname and domain name information.
    
* IPC namespaces - isolate IPC method.
    
* Net namespaces - isolate network interfaces.
    
* PID namespaces - isolate process IDs.
    
* Mount namespaces - isolate mount points.
    

**Let's create a new namespace using the** `unshare` **command:**

The `unshare` command is used to run a program with certain namespaces unshared from the parent process.

```bash
$ unshare --mount
```

This command creates a new mount namespace, which means that the program that is run after the command will have its own view of the file system. The mounts made within the new namespace won't be visible in the parent namespace.

For example, if we mount a file system inside the new namespace, it will not be visible outside of the namespace:

```bash
$ unshare --mount /bin/bash
# mkdir /mnt/test
# mount -t tmpfs none /mnt/test
# ls /mnt/test
# exit
$ ls /mnt/test
ls: cannot access '/mnt/test': No such file or directory
```

To start with, we create a new mount namespace by executing the `unshare --mount` command in this example. We then start a new shell inside the namespace using `/bin/bash`. Inside the shell, we create a new directory `/mnt/test` and mount a `tmpfs` file system on it. To verify the mounting was successful, we list the contents of the directory.

When we exit the shell, we're back in the parent namespace. If we try to access the `/mnt/test` directory, we get an error because the directory was only visible inside the child namespace.

This is just an example of how you can create a mount namespace, you can also create other namespaces using the `unshare` command, depending on your need.

### Control groups (cgroups)

![](/img/blog/understanding-how-containers-work-behind-the-scenes/ed1d833c-1013-4ae3-93f6-771d1c80c9d1.png align="center")

Cgroups help to limit the use of resources so that a single container is not utilizing all the resources available. It allows managing various system resources such as:

* CPU - limit CPU utilization.
    
* Memory - limit memory usage.
    
* Disk I/O - limit disk I/O.
    
* Network - limit network bandwidth.
    

With the help of cgroups docker engine helps to share available hardware resources with the container and puts a limit on how much resources the container can use.

**Let's create a new cgroup named "mygroup" to manage CPU resources using** `cgcreate` **command:**

1\. First, create a new directory for the cgroup:

```bash
$ sudo mkdir /sys/fs/cgroup/cpu/mygroup
```

A folder named "mygroup" is created on the above path.

![](/img/blog/understanding-how-containers-work-behind-the-scenes/bbd3c8e8-7d70-45ca-b0cd-0703f29a3811.png align="center")

All these different files define the limit on the CPU.

2\. Then, assign the "cpu" subsystem to the new cgroup:

```bash
$ sudo sh -c "echo $$ > /sys/fs/cgroup/cpu/mygroup/cgroup.procs"
```

This command adds the current shell process ID to the "cgroup.procs" file of the "mygroup" cgroup, indicating that it belongs to this cgroup.

3\. Next, set the CPU usage limit for the cgroup:

```bash
$ sudo cgset -r cpu.cfs_quota_us=50000 mygroup
```

This command sets the maximum CPU usage to 50% of one CPU core for the "mygroup" cgroup.

Now, any processes that are added to the "mygroup" cgroup will have their CPU usage limited to the specified value. For example, using the `cgexec` command, you can start a new process in the cgroup.

```bash
$ sudo cgexec -g cpu:mygroup /bin/bash
```

This command starts a new shell process in the "mygroup" cgroup with CPU usage limited to the value set earlier.

The `cgcreate`, `cgset`, and `cgexec` commands are part of the `libcgroup` package, which you may need to install before using them.

**Here's an example of how to run a Docker container with a CPU limit of 50% of one CPU core:**

```bash
$ docker run --cpus 0.5 <image>
```

This command starts a new container with the specified image and limits its CPU usage to 50% of one CPU core.

## Conclusion

In this article we saw what namespaces and cgroups are and by using these features how can docker create a unique set of namespaces and cgroups for each container, making it possible to run multiple containers on a single host machine without any problems.

I hope you understood how docker works behind the scenes 😁.

Also, check out this wonderful hands-on workshop by [Chad](https://twitter.com/ChadMCrowell) to learn more about Linux and Docker :)

%[https://www.youtube.com/watch?v=EUu1E_YKGTw&t=12948s]