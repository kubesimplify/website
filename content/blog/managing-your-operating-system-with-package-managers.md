---
title: "Managing your Operating System with Package Managers."
datePublished: 2022-12-16T13:30:44.946Z
slug: managing-your-operating-system-with-package-managers
author: aayush-sharma
cover: /img/blog/managing-your-operating-system-with-package-managers/4vfL9-2R6.png
tags: ["linux", "package", "devops", "package-manager", "technical-writing-1"]
cuid: clbqjt5f3028ggwnv58m257fc
---
# What is a Package?

Before actually learning about package managers, let us put some light on what is a package.

Almost every Linux and Unix-based software program is passed as packages, these are nothing but archives containing the pre-compiled binary software files, installation instructions, configuration information, and other software-related information.

If in today's world I ask you to download software, you would probably visit the website of the tools and click the download button to get it in your local system. But ever wondered what use to happen before this function was introduced?

Back then, software was installed from source code. Users have to jump to a file and check for the software requirements a particular tool needs to function completely, including stuff like binary locations, memory locations, and versions. To perform all these tasks, users used to create a configure script or makefile and then compile the software based on their needs by providing different conditions and handling all the dependencies on their own.

To overcome all this hard work and complex steps, Linux distributions started creating ready-to-use binary files for installing software together with certain information (version number, description, and dependencies).

Both Red Hat Linux and Debian invented the `.deb` or DEB packaging format and the `.rpm` or RPM packaging system, respectively. You require a package manager in order to interface with or use the packaging systems.

# What are Package Managers?

Let's try to relate the term and understand it with a real-world example.

Consider Linux as a small boy, it is understood amongst us all that a small boy needs someone to help him learn various new traits such as walking, talking etc. That someone always ready to help are the parents of that small boy without him asking to do so.  
In the same way, package managers act as parents of Linux to install, upgrade and remove software automatically.

Package Managers are those set of software tools that automates the installation, upgrade, configuration, and deletion of software packages within an operating system. The responsibility of a package manager is to provide an interface that helps the user manage the set of installed packages on their system.

# Package Managers for different Operating Systems

For various operating systems, there are many types and styles of package managers, as we shall soon learn in this article.

Here are some of the common package managers for different operating systems:

## \- Linux:

Here are some of the Package Managers for various Linux Distributions:

![Screenshot 2022-12-03 at 11.22.20 PM.png](/img/blog/managing-your-operating-system-with-package-managers/ynSa-yQVT.png align="left")

## \- macOS:

There is no default package manager installed on macOS, but the user can install one of the most used package manager named **Homebrew**.

MacPorts and Fink are some alternatives.

## \- Windows:

Early windows used a third-party package manager named **Chocolatey**. But now Microsoft created its own package manager called **Windows Package Manager(winget)** which can be used virtually by anyone that uses Windows 10 or Windows 11.

# Are Package Managers only specific to an Operating System?

Package Managers is not a generic concept, and it’s not exclusive to Linux. There are various software that has a package manager supporting their back to help them with various functions.

If you are someone who has been working on projects that involve coding languages such as **Python** or **Java**, you have probably used a package (dependency) manager by the name of **pip** or **maven**

List of various languages using package (dependency) manager:

![Screenshot 2022-12-12 at 7.13.29 PM.png](/img/blog/managing-your-operating-system-with-package-managers/zfNcAafYH.png align="left")

# Workings of a Package Manager

This is the overall visualization of how a package manager works:

![Working PM.png](/img/blog/managing-your-operating-system-with-package-managers/hKwdlTaDy.png align="left")

Let's try to understand the process shown in the above picture

Let us assume that you are a developer using a package manager for doing various stuff. There are software repositories, which are essentially collections of software packages. Software packages of various types can be found in the repository. These repositories contain all the details related to a package such as - name, description, dependencies, version, etc.

Whenever you use a package manager in your local system, it first collects the data from the online repository. Before using the package manager to complete tasks, it is advised to run the command with the `update` flag to update the package manager with the latest version. After you run the command (package manager name) followed by **the update** keyword, the package manager fetches all the latest data from the repository which is uploaded to a provider and is ready for further use.

Moving ahead, when a developer starts using the package manager to fulfill the tasks, the package manager refers to the data that is being fetched by running the update keyword with the command to complete the required task.

# Examples of Package Managers

## 1\. Linux (Ubuntu):

Since I am using a playground by killercoda for running Ubuntu, I will be using `apt` as a package manager.

Before actually using apt to complete tasks, let us just update it:

```plaintext
apt update
```

![Screenshot 2022-12-13 at 2.42.44 PM.png](/img/blog/managing-your-operating-system-with-package-managers/BppqMuxtQ.png align="left")

We can easily see that `apt` has fetched the metadata from the repositories that are located somewhere on the official Ubuntu website.

Now, let us try to install another package manager named [aptitude](https://manpages.ubuntu.com/manpages/xenial/man8/aptitude-curses.8.html) using **apt**.

Before that, let's check if the package manager is already present in the system by running **aptitude help** in our CLI:

```plaintext
aptitude help
```

![Screenshot 2022-12-13 at 3.07.21 PM.png](/img/blog/managing-your-operating-system-with-package-managers/9Iq1E43Xy.png align="left")

As we see that bash is throwing the error and cannot find any file or directory of such name. So let us run the command **apt install aptitude**:

```plaintext
apt install aptitude
```

![Screenshot 2022-12-13 at 3.09.41 PM.png](/img/blog/managing-your-operating-system-with-package-managers/t-0I20CWe.png align="left")

We see that the package along with the dependencies has been installed in our local system and to verify let us run the **aptitude help** again:

![Screenshot 2022-12-13 at 3.13.45 PM.png](/img/blog/managing-your-operating-system-with-package-managers/PSUYZW0IS.png align="left")

Now we can see that the package manager has been installed successfully and is working. Now if you want to uninstall the package you simply run **apt remove aptitude** and after running this command when you try to call aptitude again it will throw an error of no such file found:

```plaintext
apt remove aptitude
```

![Screenshot 2022-12-13 at 3.16.56 PM.png](/img/blog/managing-your-operating-system-with-package-managers/nLxGIEykq.png align="left")

## 2\. macOS:

As discussed, macOS does not have any default package manager installed, so will be using **Homebrew** as a package manager to run an example. To install Homebrew in your local system, you can refer to this website → [brew.sh](https://brew.sh/).

Let us just follow the old tradition of updating the package manager before using it for the actual task and to do that just hit **brew update** in your CLI:

```plaintext
brew update
```

![Screenshot_2022-12-13_at_3.46.33_PM.png](/img/blog/managing-your-operating-system-with-package-managers/ha1OqaRsk.png align="left")

Let us install minikube using brew:

```plaintext
brew install minikube
```

![Screenshot_2022-12-13_at_3.56.59_PM.png](/img/blog/managing-your-operating-system-with-package-managers/hrBFJO1A9f.png align="left")

To check if minikube is installed, we can run **minikube verison**:

```plaintext
minikube version
```

![Screenshot_2022-12-13_at_3.58.18_PM.png](/img/blog/managing-your-operating-system-with-package-managers/-nBg1g2ka.png align="left")

It is seen in the above image that the minikube is successfully installed and now to remove it from the system just hit **brew uninstall minikube**:

```plaintext
brew install minikube
```

![Screenshot_2022-12-13_at_3.59.33_PM.png](/img/blog/managing-your-operating-system-with-package-managers/A6Q6OpH_S.png align="left")

In the above image, it is confirmed that minikube is uninstalled as when you try to run **minikube version** it throws an error(minikube not found).

## 3\. Windows:

**winget** is the package manager provided by windows. To check if winget is installed in your system, just open the command prompt and run winget --help:

```plaintext
winget --help
```

![2022-12-12.png](/img/blog/managing-your-operating-system-with-package-managers/g1zopjCVb.png align="left")

Let us try to install Mozilla Firefox using winget in Windows system by using **winget install** command:

```plaintext
winget install Mozilla.Firefox
```

![2022-12-12 (3).png](/img/blog/managing-your-operating-system-with-package-managers/yUD3aX71i.png align="left")

It will ask for some administrator permissions:

![2022-12-12 (2).png](/img/blog/managing-your-operating-system-with-package-managers/sVCm4QlYF.png align="left")

![2022-12-12 (1).png](/img/blog/managing-your-operating-system-with-package-managers/N-G5rG95G.png align="left")

In the same way, you can use winget to uninstall packages by running **winget unistall** command:

```plaintext
winget uninstall Mozilla.Firefox
```

![2022-12-12 (4).png](/img/blog/managing-your-operating-system-with-package-managers/5OKzqQRwS.png align="left")

# Resources

*   [Package Management | Ubuntu](https://ubuntu.com/server/docs/package-management)
    
*   [Homebrew](https://brew.sh/)
    
*   [Windows Package Manager](https://learn.microsoft.com/en-us/windows/package-manager/)
    

# Conclusion

In this article, we learned about packages and various Package managers. There you are at the end of this blog post, I hope this blog helps you understand Package Managers. Don't forget to like and share this post if you liked this blog. Connect with me on [Twitter](https://twitter.com/SuperAayush14). Follow me for more such blogs.

**THANKS FOR READING 😄📖!!**

**#LEARNINPUBLIC** **#LEARNWHILEDOING**

[**Aayush Sharma 👨🏻‍💻**](https://superaayush.github.io/Portfolio/)

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.