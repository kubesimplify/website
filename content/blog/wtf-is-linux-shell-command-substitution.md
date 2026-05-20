---
title: "WTF is Linux Shell Command substitution."
seoTitle: "What is Shell Command Substitution."
seoDescription: "Command substitution allows you to assign the output of a shell command to a variable. This one of the most useful feature of shell scripts."
datePublished: 2022-06-06T12:31:31.517Z
slug: wtf-is-linux-shell-command-substitution
author: sysxplore
cover: /img/blog/wtf-is-linux-shell-command-substitution/RKyEYNiqvB.jpeg
tags: ["linux", "bash", "shell", "linux-for-beginners", "shell-script"]
cuid: cl42ppkxq006lxunvdq657t14
---
Command substitution allows you to assign the output of a shell command to a variable. This one of the most useful feature of shell scripts. After assigning the output to a variable, you can use the stored value anywhere in your shell scripts. This is useful when processing data in your scripts.

There are two ways to assign a command's output to a variable:

■ The backtick character (`)

■ The $() format

To do so, encircle the entire command line command with two backtick characters:

dueDate=`date`

or use the $() format:

dueDate=$(date)

The shell executes the command within the command substitution characters, and then the output is assigned to the variable dueDate. Note that there are no spaces between the assignment equal sign and the command substitution character.

Here’s an example of creating a variable using the output from a normal shell command:

```bash
┌─[traw@xtremepentest] - [~] - [Sat Jun 04, 15:53]
└─[$] <> dueDate=$(date)
┌─[traw@xtremepentest] - [~] - [Sat Jun 04, 15:53]
└─[$] <> echo $dueDate
Sat 04 Jun 2022 15:53:42 CAT
┌─[traw@xtremepentest] - [~] - [Sat Jun 04, 15:54]
└─[$] <>
```

```bash
┌─[traw@xtremepentest] - [~] - [Sat Jun 04, 15:55]
└─[$] <> dueDate=`date`
┌─[traw@xtremepentest] - [~] - [Sat Jun 04, 15:55]
└─[$] <> echo $dueDate 
Sat 04 Jun 2022 15:55:25 CAT
┌─[traw@xtremepentest] - [~] - [Sat Jun 04, 15:55]
└─[$] <>
```

The variable dueDate receives the date command's output and display it using the echo command.

That's not particularly exciting in this example, but since the command output is captured in a variable, you can do whatever you want with it.

Here's an example of how command substitution can be used to capture the current date and use it to generate a unique filename.

```bash
┌─[traw@xtremepentest] - [~/cmdsu] - [Sat Jun 04, 16:06]
└─[$] <> today=$(date)
┌─[traw@xtremepentest] - [~/cmdsu] - [Sat Jun 04, 16:06]
└─[$] <> who >> loggedusers.$today
┌─[traw@xtremepentest] - [~/cmdsu] - [Sat Jun 04, 16:07]
└─[$] <> ls
.rw-r--r-- 39 traw  4 Jun 16:07  loggedusers.Sat 04 Jun 2022 16:06:15 CAT
┌─[traw@xtremepentest] - [~/cmdsu] - [Sat Jun 04, 16:07]
└─[$] <> cat loggedusers.Sat\ 04\ Jun\ 2022\ 16:06:15\ CAT 
traw     tty2         2022-06-04 14:43
┌─[traw@xtremepentest] - [~/cmdsu] - [Sat Jun 04, 16:07]
└─[$] <>
```

In the above example, we assign the value to a variable, which is then used as part of a filename.
You can also implement command substitution in your shell scripts:

```bash
#!/bin/bash

TODAY=`date`
echo "Today's date is $TODAY"

LOGGEDUSERS=`who | wc -l`
echo "Logged in users are $LOGGEDUSERS"

UPTIME=`date ; uptime`
echo "Uptime is $UPTIME"
```

Upon execution, you will receive the following result 

```bash
┌─[traw@xtremepentest] - [~/cmdsu] - [Sat Jun 04, 16:53]
└─[$] <> bash cmd.sh 
Today's date is Sat 04 Jun 2022 16:53:39 CAT
Logged in users are 1
Uptime is Sat 04 Jun 2022 16:53:39 CAT
16:53:39 up  2:11,  1 user,  load average: 1.13, 1.39, 0.95
┌─[traw@xtremepentest] - [~/cmdsu] - [Sat Jun 04, 16:53]
└─[$] <>
```

That's it for today's article

In this thread, we learned how to use the most useful feature of shell scripts to extract information from command output and assign it to a variable. Finally, we went through a practical example in which you used the saved output as part of the log filename.

Thank you for making it this far & hopefully you found this article helpful. Feedback is really appreciated 💜

I can be found **[@xtremepentest](http://twitter.com/xtremepentest)**  on Twitter, or **[LinkedIn](https://www.linkedin.com/in/0xtraw/)**.

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.