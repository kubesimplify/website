---
title: "What is Shell Scripting?"
datePublished: 2022-06-10T12:43:51.868Z
slug: what-is-shell-scripting
author: brijesh-kori
cover: /img/blog/what-is-shell-scripting/wyjC-UOdh.jpeg
tags: ["ubuntu", "linux", "shell", "programming-languages", "learn-coding"]
cuid: cl48fwv14022o3znv6h187gxg
---
# Introduction
 In this post will give you an overview of shell programming and provide an understanding of some standard shell programs.  This includes shells such as the Bourne Again Shell (bash). Shell scripting is a part of the Unix operating system so before that, you should have some basic knowledge regarding Unix but if you don't, we have covered some basic commands which are required 

**Now let's begin **
# **First, let us understand what is shell **
A shell is a special user program which provide an interface to a user to use operating system services. The shell accepts human-readable commands from the user and convert them into something which the kernel can understand. 

![shell.png](/img/blog/what-is-shell-scripting/xFdaJc7yK.png align="left")

# To begin with some scripting, we should know some common basic command line essentials
**command line essentials**

```
cd  
> change directory command. It is used to change current working directory.
```
```
pwd
> The pwd Linux command prints the current working directory path, starting from the root ( / ).
```
```
ls
> The ls command is used to list files or directories in Linux and other Unix-based operating systems.
```
```
cp
> cp stands for copy. This command is used to copy files or group of files or directory
```
```
mv
> mv is a Unix command that moves one or more files or directories from one place to another.
```
```
rm
> rm stands for remove here. rm command is used to remove objects such as files, directories, symbolic links and so on from the file system
```
```
echo
> echo command in linux is used to display line of text/string that are passed as an argument .
```
```
cat
> cat command allows us to create single or multiple files, view content of a file, concatenate files and redirect output in terminal or files
```
```
less
> Linux utility that can be used to read the contents of a text file one page(one screen) at a time.
```
```
grep
> The grep command can search for a string in groups of files.
```
```
mkdir
> allows users to create or make new directories.
```
```
touch
> Touch is a popular command in the Linux system that can be used for performing many tasks, rather than just creating an empty file.
```
```
chmod
> chmod command is used to change the access permissions of files and directories
 ```

# what is shell script?
The basic concept of a shell script is a list of commands which are listed in the order of execution. A good shell script have comments preceded by #sign, describing the steps

**This is how a sample shell script looks like**
```
#!/bin/sh
#first script
echo"what is your name?"
read PERSON
echo "hello , $PERSON"
```
Every script starts with a **#!/bin/sh ** it is nothing but a absolute path to the interpreter of your shell

# Getting started with the scripting language 
Every Scripting  language  has variables, so let's cover Variables first.

##  Variables
### what is a variable ?
A variable is a character string to which we assign a value. The value assigned could be a number, text, filename, device or any other type of data

### variable types
**A] local varaible**
A local varaible is a variable that is present within the current instance of the shell, It is not avilabe to programs that are started by the shell they are set atrhe command prompt

**B] Environment variable**
An environment variable is avilable to any child process of the shell. some programs need environment variables in order to function correctly 

**C] Shell varaible**
a shell variable is a special variable that is set by the shell and is required by the shell in order to function correctly some of these variables are environment variables whereas others are local variables
 
**defining a variable**
variable_name="variable_value"(no spaces)
```
#!/bin/sh
NAME="KUBESIMPLYFY"
echo $NAME
```
> Note for calling a variable we should use a $ sign as seen above


**Special variables**
These variables are reserved for specific functions
The following table shows a number of special variables that you can use in your shell scripts −

![svar.png](/img/blog/what-is-shell-scripting/1Kw7eeD5a.png align="left")

Following script uses various special variables related to the command line −
```
#!/bin/sh

echo "File Name: $0"
echo "First Parameter : $1"
echo "Second Parameter : $2"
echo "Quoted Values: $@"
echo "Quoted Values: $*"
echo "Total Number of Parameters : $#"
```
There are various operators supported by Bourne shell 
## Operators
  **Arithmetic operators
**
![a_operator.png](/img/blog/what-is-shell-scripting/_XG1WevsJ.png align="left")

Bourne shell didn't originally have any mechanism to perform simple arithmetic operations, but it uses external programs, either awk or expr.

  **Realtional operators**

![relation_oper.png](/img/blog/what-is-shell-scripting/jv4RJxvXq.png align="left")
** boolean operators
**
![bool_opera.png](/img/blog/what-is-shell-scripting/Z-SKJkYDT.png align="left")
** String operators**

![string_opera.png](/img/blog/what-is-shell-scripting/yfF7o59zk.png align="left")
  **file test operators**

![file_operator.png](/img/blog/what-is-shell-scripting/pHtsA6Hku.png align="left")




 A loop is a powerful programming tool that enables you to execute a set of commands repeatedly
## shell loops
1. The While Loop
2. The For Loop
3. The Until Loop
4. Nested Loops
5. Loop control

Example:
```
#!/bin/sh

a=0
while [ "$a" -lt 10 ]    # this is loop1
do
   b="$a"
   while [ "$b" -ge 0 ]  # this is loop2
   do
      echo -n "$b "
      b=`expr $b - 1`
   done
   echo
   a=`expr $a + 1`
done
```

Functions enable you to break down the overall functionality of a script into smaller, logical subsections, which can then be called upon to perform their individual tasks when needed.

## Shell functions
**creating function**
```
#!/bin/sh

# Define your function here
Hello () {
   echo "Hello World"
}

# Invoke your function
Hello
```
**assing parameter to function**
```
#!/bin/sh

# Define your function here
Hello () {
   echo "Hello World $1 $2"
}

# Invoke your function
Hello Kube Simplyfy
```
returning values from func
```
#!/bin/sh

# Define your function here
Hello () {
   echo "Hello World $1 $2"
   return 10
}

# Invoke your function
Hello Kube simplyfy

# Capture value returnd by last command
ret=$?

echo "Return value is $ret"
```
**Nested functions**
```
#!/bin/sh

# Calling one function from another
number_one () {
   echo "This is the first function speaking..."
   number_two
}

number_two () {
   echo "This is now the second function speaking..."
}

# Calling function one.
number_one
```
# use case
**Task Automation**
The first advantage of using shell scripts is automating frequently executed tasks.

 **Combining Multiple Commands**
In addition to automating frequent tasks, you might also find it advantageous that you can combine multiple sequences of commands into a single command.

 **Transparency**
A shell script, by virtue of being a text file, can easily be viewed to check out what actions it is performing.

**Example**
To scan and Monitor networks using combination of shell script and ping command
```
#!/bin/bash

is_alive_ping()
{
ping -c 1 $1 > /dev/null

[ $? -eq 0 ] && echo Node with IP: $i is up.

}

for i in 10.1.1.{1..255}
do
is_alive_ping $i & disown

done
```
Execute:
```
./bash_ping_scan.sh
```
# Conclusion
Now we have understood the concept of Shell scripting and how it is used along with its working, I hope you have gotten the knowledge behind it and how you can use it. The next task for you is to practice and explore all the uses that can make your work easy with the help of scripting. 

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.







