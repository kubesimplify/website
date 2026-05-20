---
title: "Package Managers Demystified"
seoTitle: "Installing software in Linux"
seoDescription: "Installing software on Linux is very important thing to know especially if you want to become proficient in Linux.  APT and other package managers help us."
datePublished: 2022-05-02T12:40:35.854Z
slug: package-managers-demystified
author: muhammad-hammad-sani
cover: /img/blog/package-managers-demystified/stGB82AkQ.jpeg
tags: ["ubuntu", "linux", "package", "linux-for-beginners", "linux-basics"]
cuid: cl2opmfj8010he0nv2zh6g9xt
---
# Package Managers



### How to install Software Package on Linux?


A **Software Package** is basically a compressed archive that has all the necessary files required to run an app. There is also a high chance that app depends on other apps (meaning app has dependencies). So, to run the app, dependencies need to be installed too and this is exactly the first issue faced by almost every beginner when he moves from *Window to some Linux Distribution*

In windows, it is comparatively a very easy process to install software packages than Linux. What you have to do in windows is to go to a website, download the setup file of the app and then go through some installation process and there you go, the software is installed. We can do it on Linux, but it is not a recommended way of doing. Instead, we use **Package Managers**.

### Why we use Package Managers?
One of the reason that installing software on Linux is difficult, which results in using Package Managers, is Linux File System. Because on Linux, files in a Software Package  are split across different folders like /bin and /lib. 
![image.png](/img/blog/package-managers-demystified/W5xlk-7n_.png)
So, it is very difficult process to manage the splitting of files in different Linux File System folders manually. 

> *The tool for downloading, installing and updating software in Linux is termed as a **Package Manager**.*

### How Package Manager Works?, a brief overview!
 
The Package Manage will find the software package first, then the dependencies, and then download and install them. Package manager will know where to **put** binary files, libraries, shared files and dependencies etc. The same goes for uninstalling because Package Manager knows where it has put files and will clean these files accordingly. 

### Where Package Manager can be found?

Now, you know what a package manager is, and you may be wondering, where can you can find Package Manager. Thanks to Linux Distributions, every Linux Distribution has Package Manager.  On Ubuntu, which I will be using, we have APT (Advanced Package Tool) Package Manager which helps us install, uninstall and upgrade apps.

To check whether APT Package Manager is installed on your distribution, you can type 
`apt` command in terminal. 
If it is installed, it will show the installed version.
![image.png](/img/blog/package-managers-demystified/OjQON8Mht.png)

### Installing a Software using APT Package Manager

We have APT package manager, let's dig it further by installing java in our Ubuntu. Generally, the commands for installing software looks like 

`sudo apt install <software package name>`

To install java, type

 `sudo apt install openjdk-11-jre-headless`

![image.png](/img/blog/package-managers-demystified/KPu2fX3xt.png)

Type **Y** and installation will start. The terminal will looks something like this, 

![image.png](/img/blog/package-managers-demystified/DPLHe2dRX.png)


### Uninstalling a Software Package


Uninstalling the software is pretty much easy using Package Manager. For this, the command is 

`sudo apt remove <Package Name>`.

in case of uninstalling java, 

`sudo apt remove openjdk-11-jre-headless`


![image.png](/img/blog/package-managers-demystified/ZR7VJ9otO.png)


Then, type **Y** and Package Manager will start uninstalling. 

### APT vs APT_GET

There is one more Package Manager that you will come across is **APT-GET** Package Manager which do almost all the works that **APT** do.  But there is a little difference. 

APT is more user-friendly than APT-Get, and there is no search command available in APT-Get to search the package we want to install. 

Search Command in APT, `sudo apt search <Package Name> `

But it will not work in case of apt-get package manager.

![image.png](/img/blog/package-managers-demystified/NvdBCIber.png)

> APT is recommended by Linux Distribution as well.

### Warehouse of Software Packages

Now, we have done with how we can install software packages, but you may have a question in your mind, that from where does these software packages come from? Where does the package manager find the software to be installed and the dependencies of that software? Linux uses repositories, which you can say are the warehouses where a hundred and thousands of software packages resides. Each distribution has repositories which consists of mostly the packages you need and package manager will fetch the software packages from there. 

There are a couple of official repositories (available online) which are used by a distribution to install the software packages. This repository is stored for apt package manager in `etc/apt/`. Here you will see `sources.list` file which apt package manager will use to find the software package and then fetch it.
As these repositories are online, the links of these repositories are stored in `sources.list` file.

![image.png](/img/blog/package-managers-demystified/zBHBIB_mq.png)

### Alternative Ways to install the software packages:

Yes, it is true that there are alternatives to install the software because of several reasons. 

- There is a possibility that the software you want to install is not in these official repositories. 
- The Latest version of software is not available, the latest version takes a bit of time because of verification process of software package
- Browsers and Code editors like VS Code cannot be installed from official Repositories

### Three Alternative Ways

There are multiple alternatives, but I will be talking about some most common

1.  Ubuntu Software Center
2.  Snap Package Manager
3. Add repository to official list of repositories


### Ubuntu Software Center:
Let’s install IntelliJ using Ubuntu Software Center. 
Search Ubuntu Software in Search Bar, Open it. This kind of interface will be visible.
![image.png](/img/blog/package-managers-demystified/9N9k0eorR.png)
Type IntelliJ in search bar,  select the addition and click install.
![image.png](/img/blog/package-managers-demystified/HbYAeN_dp.png)

### Snap Package Manager:
Snap is a software package for OS using Linux Kernel. It is also preinstalled. There are certain tools/code editors which have installation guides with snap command. 
Snap is basically a bundle of software package and its dependencies. 
You can go to https://snapcraft.io/ which is a store for downloading snap of software. Search for the software, and click install. Then, you will see a command, copy it and run it in terminal.

![image.png](/img/blog/package-managers-demystified/l1m39Sb2j.png)
Or you can go to official VS Code website and there you will see this in installation guide. 
![image.png](/img/blog/package-managers-demystified/X98Nsrl0Z.png)


### Adding Repository
The third way is to add repository to official repository list (etc/apt/sources.list file) and installing from there. This is useful when downloading relatively new software. 

In installation guide, you will see how to add the repository to official repository list and once the repository is added, then you can install it using apt package manager.

### Conclusion

If you liked the blog, don't forget to like and share this blog. Follow [Kubesimplify](https://kubesimplify.com/) for more such tech blogs. Also, feel free to connect with me on [Twitter](https://twitter.com/mhammad_saani). Thank you for your patient reading.