---
title: "Nexus Repository Manager :  What is it & how to configure it on a Digital Ocean Droplet?"
seoTitle: "Nexus Repository Manager :  What is it & how to configure it on a Digi"
seoDescription: "Let's say you are building a Java-Maven application. It uses Maven Central Repository for resolving dependencies. Now if you want to use a package not provi"
datePublished: 2022-04-08T15:42:18.855Z
slug: nexus-repository-manager-what-is-it-and-how-to-configure-it-on-a-digital-ocean-droplet
author: sneh-chauhan
cover: /img/blog/nexus-repository-manager-what-is-it-and-how-to-configure-it-on-a-digital-ocean-droplet/ReijKvWX1.png
tags: ["cloud", "development", "devops", "technical-writing-1"]
cuid: cl1qljon902hfsvnv2juzdtyi
---

# Introduction
If you are working on a big project which would take long time, repository manager is the thing which can save you a lot of time and effort. 

Let's say you are building a Java-Maven application. It uses [Maven Central Repository](https://mvnrepository.com/repos/central) for resolving dependencies. Now if you want to use a package not provided by Java by default, you need to get it from Maven Central. With repository managers, these packages are stored in the repository manager itself so you don't have to look for different packages at different places.

# What is a Repository Manager? 
A **Repository manager** is a dedicated server location which is used to manage all the repositories an development team will need throughout the development cycle.

We can consider Repository Manager as a **Warehouse for parts**. Just as a Warehouse serves as a centralized location for storage of parts and manages receiving, sending and everything in between, a Repository Manager manages all the parts involved in the software development process.

### Repository v/s Repository Manager
A **Repository** is a storage location where components like artifacts, binaries or containers are retrieved so they can be installed or used whereas a **Repository Manager **is a dedicated application which manages all of your internal or proxy repositories.

### Why do you need it? 🤔
Let's say you work in a company which is working upon multiple projects. Few of which are build using Java, .NET and Python. Each of these will produce different types of artifacts. Now you'll need different software to store each of them. A Repository manager solves this problem and provides a centralized platform to store all the components involved in the software development process. Few of the other features of a repository manager are :

👉 Saving time and bandwidth due to reduced number of downloads off remote repositories.

👉 Backup and Restore

👉 Cleanup Policies

👉 Search Functionality

👉 Multi-format support

---

# Why Nexus Repository Manager? 🤔

![Screenshot 2022-04-02 2326400.png](/img/blog/nexus-repository-manager-what-is-it-and-how-to-configure-it-on-a-digital-ocean-droplet/Rt1mT1vKp.png)
Nexus Repository Manager is a **FREE-to-use** artifact repository manager by `Sonatype`. It supports a wide variety of formats like APT, NuGET, Maven and Docker. List of all supported formats can be found [here](https://www.sonatype.com/products/repository-oss-download).

Now that you know what Nexus Repository Manager is, let me show you how to configure it on a cloud server. We'll configure Nexus on Digital Ocean Droplet(cloud server) for this blog but you can do the same on almost any other cloud service. Click [here](https://try.digitalocean.com/freetrialoffer/) to get a FREE `$100 credit` on Digital Ocean for 60 days.

---

# Configuring Nexus on Digital Ocean Droplet 

###### **STEP 1** :   Create a Droplet (cloud server)
I've chosen `Ubuntu 20.04 LTS` but you are free to use distribution of your choice. You can choose the datacenter region which is nearest to your location. In my case it's `Bangalore`. You can use `Password Authentication`(less secure) or `SSH keys`(more secure) for authentication.

> **Note :** Make sure you choose `8 GB/ 4 vCPUs droplet` because Nexus takes up a ton of memory and has high CPU usage at times.

![createdroplet (1).gif](/img/blog/nexus-repository-manager-what-is-it-and-how-to-configure-it-on-a-digital-ocean-droplet/ewohD7Icq.gif)

---

###### **STEP 2** :  Log in to the droplet using it's `public IP address`
> If you used `SSH key Authentication`, you won't be prompted for password but if you used `Password Authentication`, you need to enter your password to authenticate yourself.

> **Note :** The default user for any digital ocean droplet is `root`.



```
ssh root@<IP_address>

```

![login-AdobeCreativeCloudExpress.gif](/img/blog/nexus-repository-manager-what-is-it-and-how-to-configure-it-on-a-digital-ocean-droplet/nWlAk1evA.gif)

---

###### **STEP 3** :  Install `Java version 8` and networking tools.
> Nexus repository manager requires `Java version 8` to be installed to run.

> We'll use `netstat` utility to check which port our application is listening to for which we need `net-tools` package to be installed.

To install Java version 8 and net-tools use the command :
```
apt install openjdk-8-jre-headless -y
apt install net-tools
```
To check if Java is properly installed, use the command :

```
java -version
``` 
The above command must give the output :

```
openjdk version "1.8.0_312"
OpenJDK Runtime Environment (build 1.8.0_312-8u312-b07-0ubuntu1~20.04-b07)
OpenJDK 64-Bit Server VM (build 25.312-b07, mixed mode)
``` 


---


###### **STEP 4**:  Download `Nexus Repository Manager` and `untar` it.

To download Nexus Repository manager in `/opt` use command :
```
cd /opt
wget https://download.sonatype.com/nexus/3/nexus-3.38.1-01-unix.tar.gz
``` 
To untar it, use the command :

```
tar -zxvf nexus-3.38.1-01-unix.tar.gz
``` 
After executing the above commands, when executing the command `ls`(list files and directories) , it must have 2 new directories namely `nexus-3.38.1-01` and `sonatype-work`.

```
root@ubuntu-s-4vcpu-8gb-intel-blr1-01:/opt# ls
digitalocean  nexus-3.38.1-01  nexus-3.38.1-01-unix.tar.gz  sonatype-work
```

---

###### **STEP 5**:  Create a new user `nexus`, give it appropriate permissions and change nexus configuration to run as a `nexus` user.
> Note : Services should **not** run with Root user permissions.

> Best Practice : `Create a new user for each service`.

To create a new user `nexus`, use the command :

```
adduser nexus
``` 
It will ask for user information and password. To skip filling some values, press `Enter` key.

```
root@ubuntu-s-4vcpu-8gb-intel-blr1-01:~# adduser nexus
Adding user `nexus' ...
Adding new group `nexus' (1000) ...
Adding new user `nexus' (1000) with group `nexus' ...
Creating home directory `/home/nexus' ...
Copying files from `/etc/skel' ...
New password:
Retype new password:
passwd: password updated successfully
Changing the user information for nexus
Enter the new value, or press ENTER for the default
        Full Name []: Nexus
        Room Number []:
        Work Phone []:
        Home Phone []:
        Other []:
Is the information correct? [Y/n] Y
```

Change the ownership of directories `nexus-3.38.1-01` and `sonatype-work` from `root` to `nexus`. To do so, use the command :


```
cd /opt
chown -R nexus:nexus nexus-3.38.1-01/
chown -R nexus:nexus sonatype-work/
``` 

To check if the ownership was changed, use the command :

```
ls -l
``` 
It must output :

```
drwxr-xr-x  4 root  root  4096 Apr  3 05:51 digitalocean
drwxr-xr-x 10 nexus nexus 4096 Apr  3 17:26 nexus-3.38.1-01
drwxr-xr-x  3 nexus nexus 4096 Apr  3 17:26 sonatype-work
``` 

To change nexus configuration to run as a nexus user, open the file `nexus.rc` using :

```
vim nexus-3.38.1-01/bin/nexus.rc
``` 

Replace it's contents with :

```
run_as_user="nexus"
``` 

---

###### **STEP 6**:  Login as `nexus` and start `nexus service`
To switch user from `root` to `nexus`, use the command `su - <user_name>`.

```
su - nexus
``` 
Now, to start nexus, use the command :

```
/opt/nexus-3.38.1-01/bin/nexus start
``` 
It must give the output :

```
nexus@ubuntu-s-4vcpu-8gb-intel-blr1-01:~$ /opt/nexus-3.38.1-01/bin/nexus start
Starting nexus
``` 

To check if it started successfully or not, type :

```
ps aux | grep nexus
``` 
It must give the output :

```
nexus@ubuntu-s-4vcpu-8gb-intel-blr1-01:~$ ps aux | grep nexus
root       20134  0.0  0.0  10132  3868 pts/0    S    19:08   0:00 su - nexus
nexus      20137  0.0  0.0  10028  5092 pts/0    S    19:08   0:00 -bash
nexus      20353  170 24.3 6618988 1986448 pts/0 Sl   19:10   3:13 /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java -server -Dinstall4j.jvmDir=/usr/lib/jvm/java-8-openjdk-amd64/jre -Dexe4j.moduleName=/opt/nexus-3.38.1-01/bin/nexus -XX:+UnlockDiagnosticVMOptions -Dinstall4j.launcherId=245 -Dinstall4j.swt=false -Di4jv=0 -Di4jv=0 -Di4jv=0 -Di4jv=0 -Di4jv=0 -Xms2703m -Xmx2703m -XX:MaxDirectMemorySize=2703m -XX:+UnlockDiagnosticVMOptions -XX:+LogVMOutput -XX:LogFile=../sonatype-work/nexus3/log/jvm.log -XX:-OmitStackTraceInFastThrow -Djava.net.preferIPv4Stack=true -Dkaraf.home=. -Dkaraf.base=. -Dkaraf.etc=etc/karaf -Djava.util.logging.config.file=etc/karaf/java.util.logging.properties -Dkaraf.data=../sonatype-work/nexus3 -Dkaraf.log=../sonatype-work/nexus3/log -Djava.io.tmpdir=../sonatype-work/nexus3/tmp -Dkaraf.startLocalConsole=false -Djdk.tls.ephemeralDHKeySize=2048 -Djava.endorsed.dirs=lib/endorsed -Di4j.vpt=true -classpath /opt/nexus-3.38.1-01/.install4j/i4jruntime.jar:/opt/nexus-3.38.1-01/lib/boot/nexus-main.jar:/opt/nexus-3.38.1-01/lib/boot/activation-1.1.1.jar:/opt/nexus-3.38.1-01/lib/boot/jakarta.xml.bind-api-2.3.3.jar:/opt/nexus-3.38.1-01/lib/boot/jaxb-runtime-2.3.3.jar:/opt/nexus-3.38.1-01/lib/boot/txw2-2.3.3.jar:/opt/nexus-3.38.1-01/lib/boot/istack-commons-runtime-3.0.10.jar:/opt/nexus-3.38.1-01/lib/boot/org.apache.karaf.main-4.3.6.jar:/opt/nexus-3.38.1-01/lib/boot/osgi.core-7.0.0.jar:/opt/nexus-3.38.1-01/lib/boot/org.apache.karaf.specs.activator-4.3.6.jar:/opt/nexus-3.38.1-01/lib/boot/org.apache.karaf.diagnostic.boot-4.3.6.jar:/opt/nexus-3.38.1-01/lib/boot/org.apache.karaf.jaas.boot-4.3.6.jar com.install4j.runtime.launcher.UnixLauncher start 9d17dc87 0 0 org.sonatype.nexus.karaf.NexusMain
nexus      20778  0.0  0.0  10616  3300 pts/0    R+   19:12   0:00 ps aux
nexus      20779  0.0  0.0   8160   732 pts/0    S+   19:12   0:00 grep --color=auto nexus
``` 
In my case the process with process ID `20353`. By default it is accessible on the port `8081`. We can check it using the command :
```
netstat -lpnt
``` 
It would give the output :

```
nexus@ubuntu-s-4vcpu-8gb-intel-blr1-01:~$ netstat -lpnt
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:8081            0.0.0.0:*               LISTEN      20353/java
tcp        0      0 127.0.0.1:44945         0.0.0.0:*               LISTEN      20353/java
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -
tcp6       0      0 :::22                   :::*                    LISTEN      -
``` 
We can confirm from the above output that `20353/java`(nexus service) is accessible at port `8081`. 
> If it doesn't show up in your case, give it some time(atleast 5 min) before restarting 
the service.

---

# Accessing Nexus from Browser 🤩

We can access Nexus from Browser but for that we need to configure the firewall of our droplet to allow incoming requests to port `8081`.

To do so,

👉 Click on the droplet

👉 Open `Networking` section

👉 Scroll down to the bottom and click on `Edit` button under `Firewall`

👉 Click on `Create Firewall`

👉 Name the `Firewall rule`

👉 Under `inbound rules`(rules for incoming requests), create a new `Custom` rule. Let the protocol be `TCP` and change the port to `8081`. Remove `All IPv4` and `All IPv6` from sources and put your `Public IP address` in that field because you don't want your nexus service to be accessible to anyone.

> You can get your `Public IP address` from the URL :
> 
```
https://ifconfig.me/
``` 

![firewall.gif](/img/blog/nexus-repository-manager-what-is-it-and-how-to-configure-it-on-a-digital-ocean-droplet/69sl19_Z7.gif)

Now to access it from your browser, open up your browser and in the address bar type:

```
<Droplet's_IPv4>:8081
``` 
for example it's ` 143.110.189.99:8081`  in my case where `143.110.189.99` is my Droplet's IPv4 and `8081` is the port number.

![nexusinbrowser.gif](/img/blog/nexus-repository-manager-what-is-it-and-how-to-configure-it-on-a-digital-ocean-droplet/p8PpK3Dsk.gif)

Congratulations🥳! You're all set to use Nexus in your Browser🤩.

---

# Conclusion
If you learnt something new from this blog, make sure you like, share and follow `Kubesimplify` for more such informative blogs. Also, feel free to connect with me on [Twitter](https://twitter.com/snehstwt). Thank you for reading!📃

Last but not the least, join Kubesimplify community for more such amazing blogs!🤩




 

 









