---
title: "Installing Prometheus with SELinux"
seoTitle: "Installing Prometheus with SELinux"
seoDescription: "Shows how to use SELinux to install Applications"
datePublished: 2022-05-16T12:34:49.747Z
slug: installing-prometheus-with-selinux
author: leon
cover: /img/blog/installing-prometheus-with-selinux/kNYOh6QQj.jpg
tags: ["linux", "security", "monitoring", "k8s", "thw-cloud-computing"]
cuid: cl38pkxye00c5rxnv8g14aog1
---
## Introduction
In the world of serverless, there are still system admins who host applications on ec2 instances, while most of them are Amazon Linux they use the same package manager as RHEL, CentOS  that is `yum` or `DNF`

There are many tutorials on how to set these up, but setting these up with SELinux disabled is not recommended. There are alternatives to SELinux such as Systemd Sandboxing. 
Most of the tutorials tell you to straight-up disable SELinux, so in this one, I'm asking you to be a bit patient and troubleshoot.

One of the best SELinux tutorial/Debug guide is [here](https://access.redhat.com/articles/2191331) and [here](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/troubleshooting-problems-related-to-selinux_using-selinux)

###  Getting your hands dirty!

Firstly, let's create a Prometheus user.
```
# useradd -s /sbin/false prometheus
or
$ sudo useradd -s /sbin/false prometheus
```
Install the SELinux Tools listed [here](https://support.rstudio.com/hc/en-us/articles/4579112985751-SELinux-a-quick-primer-and-troubleshooter)

To start, install and extract the Prometheus zip file from
```
sudo -u prometheus  wget https://github.com/prometheus/prometheus/releases/download/v2.35.0/prometheus-2.35.0.linux-amd64.tar.gz
```
Then unzip it.
```
sudo -u prometheus tar -xvf prometheus-2.35.0.linux-amd64.tar.gz
```

Once you create the prometheus service, `vim /etc/systemd/system/prometheus.service`
```
# /etc/systemd/system/prometheus.service
[Unit]
Description=Prometheus Server
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/home/prometheus/prometheus \
--config.file=/home/prometheus/prometheus.yml \
--storage.tsdb.path=/home/prometheus/ \
--web.console.templates=/home/prometheus/consoles \
--web.console.libraries=/home/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```

Then do:
```
# systemctl daemon-reload
# systemctl start prometheus
```


You will get hit with an error if you check `journalctl -t setroubleshoot`

```
SELinux is preventing /usr/lib/systemd/systemd from execute access on the file prometheus.

*****  Plugin catchall (100. confidence) suggests   **************************

If you believe that systemd should be allowed execute access on the prometheus file by default.
Then you should report this as a bug.
You can generate a local policy module to allow this access.
Do
allow this access for now by executing:
# ausearch -c '(ometheus)' --raw | audit2allow -M my-ometheus
# semodule -X 300 -i my-ometheus.pp


Additional Information:
Source Context                system_u:system_r:init_t:s0
Target Context                unconfined_u:object_r:admin_home_t:s0
Target Objects                prometheus [ file ]
Source                        (ometheus)
Source Path                   /usr/lib/systemd/systemd
Port                          <Unknown>
Host                          rocky8.5
Source RPM Packages           systemd-239-51.el8_5.5.x86_64
Target RPM Packages
SELinux Policy RPM            selinux-policy-targeted-3.14.3-80.el8_5.2.noarch
Local Policy RPM              selinux-policy-targeted-3.14.3-80.el8_5.2.noarch
Selinux Enabled               True
Policy Type                   targeted
Enforcing Mode                Enforcing
Host Name                     rocky8.5
Platform                      Linux rocky8.5 4.18.0-348.23.1.el8_5.x86_64 #1 SMP
                              Wed Apr 27 15:32:52 UTC 2022 x86_64 x86_64
Alert Count                   1
First Seen                    2022-05-06 21:43:51 IST
Last Seen                     2022-05-06 21:43:51 IST
Local ID                      562818dd-247b-40b2-9b24-f63020bb46b7
```
At this point, you're probably going, "Oh shit it's SELinux again, I should disable it", nope.

The error has too much info, so I just focus on `Source Context` and  `Target Context` as you can see, prometheus is a binary and systemd is trying to run it, but it fails.

SELinux uses domains, so when you try to execute a binary systemd has to transition to that domain, for further reading I would suggest [Gentoo's wiki](https://wiki.gentoo.org/wiki/SELinux/Tutorials/Linux_services_and_the_system_u_SELinux_user)

This can be checked by searching the domains using:
```
sesearch --allow --source init_t --target user_home_t  --class file --perm execute
```
This will yield no results.
However, this will:
```
sesearch --allow --source init_t --target bin_t --class file --perm execute
allow init_t base_ro_file_type:file { execute execute_no_trans getattr ioctl lock map open read };
allow init_t bin_t:file { execute execute_no_trans getattr ioctl lock map open read }
```
As you can see here, the source (domain) `init_t` can perform `{ execute execute_no_trans getattr ioctl lock map open read };` on the target domain `bin_t:file` of the type file.
More detailed information can be found [here](https://wiki.gentoo.org/wiki/SELinux/Tutorials/How_SELinux_controls_file_and_directory_accesses)

A simple fix is to relabel the library using a file that you know works

```
chcon --reference=/bin/less /home/prometheus/prometheus
```
This will fix the issue with the systemd service, however it is prone to a relabel on system reboot.
To make it permanent
```
semanage fcontext -a -t bin_t "/home/prometheus/prometheus"  
```

That's it, yes SELinux is complicated, and hard, but tutorials such as the ones on Gentoo make it easier, even I'm quite new to it and learning it, so if I've made mistake please correct me!

I can be found [@mediocredevops](https://twitter.com/mediocreDevops) on Twitter, or [LinkedIn](https://linkedin.com/in/leon-nunes).

If you've enjoyed it or have any queries, please feel free to reach out.

### Resources
[Gentoo Wiki](https://wiki.gentoo.org/wiki/SELinux/Tutorials)
[RedHat SELinux](https://access.redhat.com/articles/2191331)