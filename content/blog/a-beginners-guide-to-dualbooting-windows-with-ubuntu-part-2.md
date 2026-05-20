---
title: "A beginner's guide to Dualbooting Windows with Ubuntu: Part 2"
seoTitle: "A beginner's guide to Dualbooting Windows with Ubuntu: Part 2"
datePublished: 2022-04-29T12:41:10.632Z
slug: a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2
author: arnav-barman
cover: /img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/3wTRZlVqG.png
tags: ["linux", "linux-for-beginners", "linux-basics", "thw-cloud-computing"]
cuid: cl2kfbmdz053x13nv5ki01rn5
---
### What have we covered in [Part 1](https://kubesimplify.com/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1) of the Dualbooting Guide.
- Intro to Dual-booting
- Compatibility checks and prerequisites for dual-booting.
- Partitioning of the disk.
- Live USB creation.

We are now moving on to the next steps.

### Booting up using the live USB
We will boot up our system using the live Ubuntu USB we created using Rufus in [Part 1](https://kubesimplify.com/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1) of the guide.
1. Plug in the live USB to your system.
1. Search `Change advanced start-up options` from the start panel and go to the settings.
![boot1.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/ueVvfTrnl.png)
1. Go to the **Advanced Startup** option and click Restart now.
![boot2.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/0sB6QA8Pq.png)
1. Select the **Use a device** option when prompted.
![boot3.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/zmNKwN1ag.png)
1. Now, select the USB drive you have plugged into your computer.
1. Your system will now boot into the disk you selected in the previous step, and you will see a similar menu.
![grub1.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/5C0Lliu5N.png)
1. Navigate using arrow keys and select **Install Ubuntu**, now press enter.

### Installing Ubuntu
Now, the Ubuntu installation wizard must be visible to you.
1. Select your preferred language.
1. Select the keyboard layout you use on your system and continue.
![ins1.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/CUX3OWXqo.png)
1. You will now be asked to enter your Wi-Fi settings; skip this step without entering the information (You can do it after dualbooting).
1. You will now be presented with the type of installation you want to perform and some other options. Select **Normal Installation** and uncheck every other option on the page to speed up the installation process. 
![ins2.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/qQfomKAp9.png)
 > You can perform the updates and firmware installations after dual booting.
1. On the next screen, select the **Something Else** option and continue. This way, we can create partitions for Ubuntu manually in the unallocated space that we set aside in [Part 1](https://kubesimplify.com/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1) of the guide.
![ins3.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/4-C63IlrO.png)
1. Up next, from the list now visible, select the unallocated free space (131072 MB in our case).
1. Now press the + button at the bottom to create the partitions in this free space.
![ins4.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/PzKHeH7Qz.png)

### Partitioning of free space
The partition table will have the following scheme in my case, you can assign space as per your requirements:

1. **EFI System Partition**: It holds the EFI-mode bootloaders and related files.
   - Size: **256 MB**
   - Type: **Primary**
   - Location: **Beginning of this space**
   - Use as: **EFI system partition**
![part1.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/MjBU3KOjt.png)
1. **Swap Partition**: Reserved space on the drive used to swap pages if physical RAM becomes full.
   - Size: **16384 MB** (i.e. equal to the RAM available in the system for systems with more than 8 GB RAM, else 1.5 times that of the RAM available)
   - Type: **Logical**
   - Location: **Beginning of this space**
   - Use as: **swap area**
![part2.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/XrMfag--O.png)
1. **Root Partition**: A space containing files required to run the Linux system after the kernel has been booted up.
   - Size: **45773 MB** (i.e. 40% of the remaining free space)
   - Type: **Logical**
   - Location: **Beginning of this space**
   - Use as: **Ext4 journaling file system**
   - Mount point: **/**
![part3.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/74CYlzRB-.png)
1. **Home partition**: A space for storing personal files (application settings, downloads, documents, etc).
   - Size: **68659 MB** (i.e. the remaining free space)
   - Type: **Logical**
   - Location: **Beginning of this space**
   - Use as: **Ext4 journaling file system**
   - Mount point: **/home**
![part4.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/ImKSpOxSP.png)
1. Now that all four partitions are created, click on the install now button. (Press continue/yes on any warning displayed).

### Finishing off the installation
Consider this a checkpoint in your journey; if you are here after a few cups of coffee and without any significant issues, pat yourself on your back as you have almost completed the dual-boot.
- Select the timezone you belong to when prompted.
![done1.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/9XLgm0QJ7.png)
- Enter the necessary details about the system now.
![done2.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/9qbJGpDeT.png)
- Now grab a cup of coffee and wait until the installation is completed. After the installation is done, reboot your system.
![installation-complete-ubuntu.jpg](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/GIknGKukK.jpg)
- You will be asked to remove the installation media (Live USB). Remove it, and the next thing you should see is the grub screen, where you can select the OS you want to boot into. 
![grub.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/DMT4rA-U_.png)

### Update the Ubuntu applications and packages
After logging in to Ubuntu for the first time, connect to your Wi-Fi network first. Then press ctrl+alt+t to launch the terminal. Run the following commands to update everything to the latest version. After entering a command with `sudo`, you will have to type in the password for the Ubuntu system that you set up:
>Press y every time it is prompted

```
sudo apt-get update
```
This is done to download package information from all configured sources.
```
sudo apt-get upgrade
```
This is done to install available upgrades of all packages currently installed on the system.

### Change the boot order and boot time
Every time you boot up your system, it shows up in the GRUB menu for 10 seconds before selecting the default OS to boot into unless the user has selected something. We will now change this waiting time and the default OS to boot into. Follow the steps to do so:
- While logged in to Ubuntu, open up the terminal (ctrl+alt+t).
- Run the following command
```
sudo apt install grub-customizer
```
- Once installed, search for Grub customizer in the menu and open it.

**Changing boot order**
- To make windows the default OS, select it and move it up the order using the up arrow.
![gc1.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/gPR6KhVwz.png)
- Press the save button and reboot your system.
![gc2.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/o-lPx4AwW.png)

**Changing the waiting time**
- Open the Grub customizer software and go to the **general settings**.
- Change the default boot time to any value.
![gc3.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-2/auwTx5Vwn.png)
- Save the changes and reboot your system.

#### Troubleshooting
For any issues that you run into, try searching google or [askubuntu](https://askubuntu.com/) for the solutions.

#### References
- [Ubuntu Installation guide](https://help.ubuntu.com/lts/installation-guide/)
- [Change boot order on Ubuntu](https://youtu.be/Yp0dM-tsRl0)

Liked the guide? Want to connect? You can find me [here](https://linktr.ee/arnav_barman). Till then, happy learning!