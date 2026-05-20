---
title: "How to change Directory In Shell Scripts?"
seoTitle: "How to change Directory In Shell Scripts?"
seoDescription: "For convenience, there are times you may want to run a shell script that changes your current working directory to another directory."
datePublished: 2022-06-02T12:33:05.669Z
slug: how-to-change-directory-in-shell-scripts
author: sysxplore
cover: /img/blog/how-to-change-directory-in-shell-scripts/NGlNBLt9s.png
tags: ["bash", "shell", "script", "linux-for-beginners", "linux-basics"]
cuid: cl3x006y900aw93nvfd5g5ebj
---
- Can We Use Cd Command In Shell Script?
- Can I Change Directory In A Bash Script?
- How Do I Change The Path Of A Bash Script?

For **convenience**, there are times you may want to run a shell script that changes  your current working directory to another directory. For example, if you frequently visit  your projects directory(~/Projects) and want to quickly navigate there, you can write a Bash script to do so.

In this thread, I'll explain  how you can do this with the cd command. I will also explain some complexities of how cd behaves along the way.

## A Common Problem

Let's start with a script that navigates to the ~/Projects directory. We'll call it [chdir.sh](http://chdir.sh/):

```bash
#!/usr/bin/bash
# Filename: chdir.sh

# change our current directory to ~/Projects
cd /home/traw/Projects

#print working directory
pwd

# print the PID of the shell running our script
echo $$
```

Let's understand our code:
cd  ~/Projects - allows you to change your current working directory to ~/Projects
pwd - pwd will print working directory
echo $$ - $$ is a Bash internal variable that contains the Process ID (PID) of the shell running your script.

**Running our script**

```bash
┌─[traw@xtremepentest] - [~] - [Mon May 30, 13:59]
└─[$] <> bash chdir.sh 
/home/traw/Projects
118922
┌─[traw@xtremepentest] - [~] - [Mon May 30, 13:59]
└─[$] <>
```

As we can see, running our script produces the expected output of */home/traw/Projects* as well as the shell's process ID.

Let's see what directory we're in now that we've run the script.

```bash
┌─[traw@xtremepentest] - [~] - [Mon May 30, 13:59]
└─[$] <> bash chdir.sh 
/home/traw/Projects
118922
┌─[traw@xtremepentest] - [~] - [Mon May 30, 13:59]
└─[$] <> pwd
/home/traw
┌─[traw@xtremepentest] - [~] - [Mon May 30, 14:36]
└─[$] <>
```

This is not what we expected because the current directory has not been changed to /home/traw/Projects. So, what may be the problem?

Let's look at our shells' process ID:

```bash
┌─[traw@xtremepentest] - [~] - [Mon May 30, 14:36]
└─[$] <> echo $$
77714
┌─[traw@xtremepentest] - [~] - [Mon May 30, 14:39]
└─[$] <>
```

We can clearly see that the process ID of the shell we're in (PID 77714) and the shell script (PID 118922) are totally different.

This is a normal behaviour. The script is executed in a separated, independent shell (subshell/childshell). This separate shell exits at the end of the script, leaving the parent shell, which we are currently in, unaffected.

Now the question is,  how  can we overcome this problem? Well, continue to read

## Running Scripts in Parent Shell

To allow our script to execute commands in the current shell (parent shell) we can use the source command. The source command executes commands within the current shell context instead of creating a new shell to execute them. The source command has a shortcut alias, called the dot operator (.).

Great! So we can run bash script in the current shell:
Let's try out:

```bash
┌─[traw@xtremepentest] - [~] - [Mon May 30, 14:46]
└─[$] <> source chdir.sh 
/home/traw/Projects
77714
┌─[traw@xtremepentest] - [~/Projects] - [Mon May 30, 14:49]
└─[$] <>
```

Let’s also verify that the directory we’re in has now changed:

```bash
┌─[traw@xtremepentest] - [~/Projects] - [Mon May 30, 14:50]
└─[$] <> pwd
/home/traw/Projects
┌─[traw@xtremepentest] - [~/Projects] - [Mon May 30, 14:51]
└─[$] <>
```

Nice! So far, we've shown that we can run shell scripts in the current shell by using source.

Alternatively, we could have used the short-form . operator.

```bash
┌─[traw@xtremepentest] - [~] - [Mon May 30, 14:46]
└─[$] <> . chdir.sh 
/home/traw/Projects
77714
┌─[traw@xtremepentest] - [~/Projects] - [Mon May 30, 14:49]
└─[$] <>
```

## Using Bash Functions

Creating a Bash script for each directory is a pain. Instead, we could incorporate several Bash functions into a single script:

```bash
#!/usr/bin/bash

# Filename: chdirs.sh
# This file should be sourced

function music() {
    cd "~/Music"
}

function docs() {
    cd "~/Documents"
}
```

Now, if we source the file:

We can use the functions within that script in our current terminal:

```bash
┌─[traw@xtremepentest] - [~] - [Mon May 30, 15:18]
└─[$] <> source chdirs.sh 
┌─[traw@xtremepentest] - [~] - [Mon May 30, 15:18]
└─[$] <> docs
┌─[traw@xtremepentest] - [~/Documents] - [Mon May 30, 15:18]
└─[$] <> music
┌─[traw@xtremepentest] - [~/Music] - [Mon May 30, 15:18]
└─[$] <>
```

## Using Alias

We can improve our Bash functions even further by using the built-in alias command. An alias is easier to use than a function because it requires less typing.

Let's see if we can convert our functions into their alias variants:

```bash
#!/usr/bin/bash

# Filename: chdirs.sh

# This file should be sourced
alias music="cd ~/Music"
alias docs="cd ~/Documents"

```

In comparison to the bash functions we wrote previously, we can see how concise this is. Furthermore, we can use the alias in the same way that we have used the functions:

That's it:

In this article, we've seen several ways to use the cd command from within Bash. First, we discovered that running a shell script starts its own process. Finally, we looked at how we could improve our Bash scripts by using functions and the *alias* command.

Thank you for making it this far & hopefully  you found this article helpful.
Feedback is really appreciated 💜

I can be found [@xtremepentest](twitter.com/xtremepentest) on Twitter, or [LinkedIn](https://www.linkedin.com/in/0xtraw/).

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.
