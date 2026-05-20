---
title: "How to setup your ftp server in Linux"
seoTitle: "How to setup your ftp server in Linux"
seoDescription: "In this tutorial I'm going to show you how you can setup your own ftp server on linux."
datePublished: 2022-11-21T12:30:42.131Z
slug: how-to-setup-your-ftp-server-in-linux
author: sysxplore
cover: /img/blog/how-to-setup-your-ftp-server-in-linux/mTOuSb3Rw.jpeg
tags: ["ftp", "server", "bash", "kubernetes", "li"]
cuid: claqrnmtl00oykvnv77coh94f
---
In this tutorial I'm going to show you how you can setup your own ftp server on linux. But before we begin I'm going to give you a brief description of what ftp is.

## What is FTP(File Transfer Protocol)?

[FTP](https://en.wikipedia.org/wiki/File_Transfer_Protocol) is an acronym for File Transfer Protocol. As the name suggests, FTP is used to transfer files between computers on a network. You can use FTP to exchange files between computer accounts, transfer files between an account and a desktop computer, or access online software archives. Keep in mind, however, that many FTP sites are heavily used and require several attempts before connecting.

An FTP address looks a lot like an HTTP or website address, except it uses the prefix ***ftp://*** instead of ***http://***.

Typically, a computer with an ***FTP*** address is dedicated to receive an ***FTP*** connection and a computer dedicated to receive an FTP connection is referred to as an ***FTP*** *server* or ***FTP*** *site*.


### How to set it up

Now you know what ***FTP*** is, let’s begin a special adventure. We will make FTP server to share files with friends and family. I will use [vsftpd](https://security.appspot.com/vsftpd.html) for this purpose.

[VSFTPD](https://security.appspot.com/vsftpd.html) is an FTP server for Unix-like systems, including Linux. It is the default FTP server in the Ubuntu, CentOS, Fedora, NimbleX, Slackware and RHEL Linux distributions. In fact, the first two letters in VSFTPD, stand for “very secure”. The software was built around the vulnerabilities of the FTP protocol.

Nevertheless, you should always remember that there are better solutions for secure transfer and management of files such as ***SFTP*** (uses [OpenSSH](https://www.openssh.com/)). The FTP protocol is particularly useful for sharing **non-sensitive** data and is very reliable for that.

#### Step 1: Installing VSFTPD in Linux

You can quickly install VSFTPD on your Fedora/Red Hat/SUSE servers/pc by issuing the following command on your terminal

```
0xtraw@xtremepentest# dnf -y install vsftpd
```

If you are using Ubuntu/Debian-based distributions, you can install VSFTPD using this command:

```
0xtraw@xtremepentest# sudo apt-get install vsftpd
```

If you are using Arch-based distributions, try this command for installing VSFTPD.

```
0xtraw@xtremepentest# sudo pacman -S vsftpd
```

***That's basically it for the installation, now let's quickly jump into setting it up***

### Step 1: Installing VSFTPD on Linux

You can quickly install VSFTPD on your Fedora/Red Hat/SUSE servers through the command line interface with:

```
dnf -y install vsftpd
```

If you are using Ubuntu/Debian-based distributions, you can install VSFTPD using this command:

```
sudo apt-get install vsftpd
```

If you are using Arch-based distributions, try this command for installing VSFTPD.

```
sudo pacman -S vsftpd
```

### Step 2: Configuring FTP server

The vsftp config file is usually located in `/etc/vsftpd.conf`. The config file itself is well-documented, so this section will only highlight some important changes you may want to make. For all available options and basic documentation, see the man pages by simply issuing the following command on your terminal.

```
man vsftpd.conf
```

And files are served by default from `/srv/ftp` directory as per the ***Filesystem Hierarchy Standard***. You can use an available text editor  of your choice for editing the ftp config file (/etc/vsftpd.conf). If in my case I will be using nano editor which comes pre-installed on most linux distros. If you also want to use nano issue the following command.

```
0xtraw@xtremepentest# nano /etc/vsftpd.conf
```

#### Enable Uploading to the FTP server:

The “write_enable” flag must be set to YES in order to allow changes to the filesystem, such as uploading: If this entry is comment, uncomment it by simply removing the leading # sign

```
write_enable=YES
```

#### Allow Local Users to Login:

In order to allow users in /etc/passwd to login, the “local_enable” directive must look like this:

```
local_enable=YES
```

#### Anonymous Login

The following lines control whether anonymous users can log in:

```
# Allow anonymous login
anonymous_enable=YES
# No password is required for an anonymous login (Optional)
no_anon_password=YES
# Maximum transfer rate for an anonymous client in Bytes/second (Optional)
anon_max_rate=30000
# Directory to be used for an anonymous login (Optional)
anon_root=/example/directory/
```

#### Chroot Jail

It is possible to set up a chroot environment, which prevents the user from leaving his/her home directory. To enable this, add/change the following lines in the configuration file:

```
chroot_list_enable=YES 
chroot_list_file=/etc/vsftpd.chroot_list
```

The “*chroot_list_file*” variable specifies the file in which the jailed users are contained to.

***Now done setting our ftp server, it's time to get it up and running!***

### Step 4: Restart your FTP server

To get your ftp server up and running with the new configurations, type the following command on your terminal and hit enter

```
0xtraw@xtremepentest# sudo systemctl restart vsftpd
```
Congrats if you have reached this far.  If you have any problem setting up the ftp server feel free to dm on Twitter [xtreme pentesting](https://twitter.com/xtremepentest)

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.