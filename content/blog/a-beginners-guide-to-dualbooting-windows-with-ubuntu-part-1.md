---
title: "A beginner's guide to Dualbooting Windows with Ubuntu: Part 1"
seoTitle: "A beginner's guide to Dualbooting Windows with Ubuntu: Part 1"
seoDescription: "It is a technique of keeping multiple live OS on a system."
datePublished: 2022-04-28T12:39:22.375Z
slug: a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1
author: arnav-barman
cover: /img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/0aqmUymHN.png
tags: ["linux", "windows", "linux-for-beginners", "linux-basics", "thw-cloud-computing"]
cuid: cl2iztg6601gb13nv4vtz1erx
---
### What does dual-booting mean?
- It is a technique of keeping multiple live OS on a system.
- Lets us select an OS at the initial boot sequence using **GRUB** (Grand Unified Bootloader - a bootloader utility).

![grub.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/7g7aHwuy0.png)
- **Advantages** of Dualbooting:
 - Offers the best of both worlds.
 - Gives the choice of selecting an OS for a particular task to the user.
- Why choose Dualboot over a Virtual machine?
 - Dual-booting cuts out the overhead of a virtual machine.
 - Runs both the OS at user hardware's full, native speed, with a catch that only one OS can run at a particular instant. 
- **Disadvantage** of Dualbooting:
 - No multitasking is possible. The user must reboot the system every time to switch to the other OS.
 - Requires a lot of space to be separated for the other OS on the system.

### Before we start: Prerequisites and Compatibility
Today, we will be dual-booting Windows with Ubuntu 20.04 LTS (long-term support).
1. Check the **BIOS mode** of your system for compatibility.
 - Search `System Information` from the start panel.
 - Under the BIOS mode, you can see your boot mode.
 - If it is UEFI, you're good to go. But if it is Legacy, I'll cover it up some other day.

 ![UEFI.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/NDYCW9sPg.png)

1. Make sure your system matches the requirements for Ubuntu mentioned [here](https://ubuntu.com/download/desktop#:~:text=Recommended%20system%20requirements%3A)
1. Check if you have about 120 GB of free disk space on your system.
1. You will also need an empty USB drive, at least 8 GB in size. 
1. Download the following files and softwares:
 - [Ubuntu 20.04 LTS ISO file](https://ubuntu.com/download/desktop/thank-you?version=20.04.4&architecture=amd64)
 - [Rufus](https://rufus.ie/en/)
1. Check if your drive is BitLocker encrypted
 - Search for `BitLocker` in the start panel. If the Manage Bitlocker settings option does not show up in the search results, your drive is not BitLocker encrypted, and you can proceed with the further steps. But if the settings show up in the results, follow the steps in the expandable section below.

<details>
	<summary>What to do if my drive is BitLocker encrypted?</summary>
 You'll have to disable the encryption before the dualbooting process and re-enable it afterward! First, back up your 40-digit recovery key to reset BitLocker encryption.
![bitlocker-encryption-windows.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/YNdjsPDnP.png)
Select the backup option and save the recovery key to your Microsoft account.
![encryption key.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/A5E50BqHs.png)
Crosscheck your Microsoft account for the [saved key](https://account.microsoft.com/devices/recoverykey?refd=support.microsoft.com)
![bitlocker key.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/PjcHG0o8m.png)
Now, click the disable BitLocker button and wait while the drive is being decrypted.
![disable BitLocker.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/sZT5fF6rA.png)
Now that you have disabled your BitLocker encryption, continue with the next steps. Also, don't forget to re-enable it from the settings after dual-booting your system (select the *Encrypt used disk space only* and *New encryption mode* when prompted).
![Enable BitLocker.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/AY8dQ_gSr.png)
</details>

> Note: Make a **backup** of your existing data somewhere before proceeding to the next steps. Also, make a windows recovery disk (to fix any significant boot issues you might run into, this is unlikely to happen, but one must better be prepared than sorry.)

### Disk Partitioning
Now that we have all the requirements complete, let's move on to the next step: Allocating some free space for Ubuntu on our drive manually. We do this as sometimes the option for it is not available during the installation process. The steps for the same are: 
1. In windows, launch the disk management tool (Win key+x, then select disk management from the list)
1. Select the drive where you want to allocate the free space.
![disk_mgmt.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/Wrd8e3O2K.png)
1. Right-click on it and select the shrink volume option
![shrink vol.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/fYQ7DHBXX.png)
1. Fill in the amount of space you need to allocate for ubuntu (This depends on the resources you need in ubuntu, anywhere from 60-80 GB might suffice). We are making an unallocated space of 120 GB (120*1024 = 131072 MB).
![shrink menu.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/fj7EsmPMt.png)
>Note: Try to leave a bit of available space if you are creating a partition in your C drive as the Windows OS is also present in the same drive, and it might require some free space in the later day-to-day use.
1. Click on the Shrink button, and you will see an unallocated data partition in your disk management tool in a moment.

>Warning: Do not forget to make a backup of your data before starting the disk partitioning, as you might lose your data during this.

### Creating a bootable flash drive for Ubuntu
Now we need to flash our iso file onto our USB drive to boot into ubuntu and install it in the unallocated space in our drive. Plug the USB drive into your system and follow these steps:
1. Open **Rufus** and select your USB drive from the dropdown menu.
1. Press the select button, browse for the downloaded Ubunto ISO file, and select it.
1. Select the **GPT** partition scheme from the dropdown menu and ensure the target system is **UEFI**.
1. In the format options, select **FAT32** file system and set the cluster size to default.
1. Make sure all the settings look similar to the screenshot attached below, and press the **Start button**.
1. Now, wait for the process to complete, which will render you the bootable drive for your Ubuntu installation.

![rufus.png](/img/blog/a-beginners-guide-to-dualbooting-windows-with-ubuntu-part-1/M0hVsWRSh.png)

>You can format your flash drive to bring it back to normal after ubuntu installation.

### The next steps
If you have been able to follow along till this point without any issues, congratulations! You're halfway through the process. Follow along in the second part of the guide to complete the dual-booting process!

#### References
- [Ubuntu Installation guide](https://help.ubuntu.com/lts/installation-guide/)
- [Dualboot with Bitlocker Encryption](https://youtu.be/dEDvGyuK9e0?t=172)

Liked the guide so far? Want to connect? You can find me [here](https://linktr.ee/arnav_barman). Till then, happy learning!