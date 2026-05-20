---
title: "Everything you need to know about the Linux 'ls' command."
seoTitle: "Everything you need to know about Linux ls command."
seoDescription: "The ls command is one of the most commonly used Linux commands for listing available files or directories from the command line."
datePublished: 2022-06-09T12:33:49.695Z
slug: everything-you-need-to-know-about-the-linux-ls-command
author: sysxplore
cover: /img/blog/everything-you-need-to-know-about-the-linux-ls-command/0KyaxZ-6K.png
tags: ["linux", "bash", "shell", "linux-for-beginners", "shell-script"]
cuid: cl47043ib02hdiunvf9893czk
---
The ls command is one of the most commonly used Linux commands for listing available files or directories from the command line.

In this article, we'll go over the ls command in depth, as well as some of the most important flags you'll need on a daily basis.

## Basic listing 
In its most basic form, the ls command displays the files and directories in your current directory.

![ls.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/w2QFYWIts.png align="left")

Notice that the ls command displays its output in alphabetical order. If you're using a color-enabled terminal emulator, the ls listing will display different types of entries in different colors.

If you don't have a terminal emulator that supports colors, you can use the `-F` parameter with the ls command to easily distinguish between directories and files. The `-F` parameter flags a folder with a forward slash (/) and an executable with an asterisk (*), as you can clearly see below.


![ls -f.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/btFm8YnhV.png align="left")

## Display hidden files
Linux often use hidden files to store some configuration information. Hidden files in Linux are those with filenames that begin with a period (.). These files don't appear in the default ls listing , thus called hidden files. The `-a` parameter with the ls command is used to display hidden files alongside normal folders and files.

![ls -a.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/VXvlS0NDf.png align="left")

## List files recursively
Another option we can use with the `ls` command is the recursion parameter `-R`. It  displays files contained within subdirectories in the current directory. When you have a lot of subdirectories, the list can get quite long. 

Here's an illustration of what the `-R` parameter can show.




Notice that the `-R` parameter shows the contents of the current directory `sources` as shown above. It also shows each subdirectory in the `sources` directory, which are `btop`, `zoom`, etc., and their contents. 

![ls -r.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/fW2B9jJfm.png align="left")

## Display Long Listing

The ls command produces little information about each file in the basic listings. Another popular parameter for listing additional information is -l. The -l option generates a long listing format, which provides more information about each file in the directory.

In addition to the filename, the listing shows additional useful information about each file (or directory):

1. The file type — such as directory d , a file - , linked file l , character device c , or block device b
2. The file permissions rwx. 
3. The number of file hard links 
4. The file owner username in this case it's traw 
5. The file primary group name in this case it's traw
6. The file byte size 
7. The last time the file was modified 
8. The filename or directory name


![ls -l.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/k5Q5nXW5v.png align="left")

##  List files in long format with readable file sizes

From the above snippet, you can notice that the file sizes were not in a readable format. In order to display the file sizes in a readable format, we need to use the `-h`.

![ls -lh.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/ocNZNqpE-.png align="left")

**Quick Tip**
Option parameters don't have to entered separately, they can be combined as shown above.

## List only directories

Another great feature of the ls command is the ability to list directories only, excluding their contents. The `-d` options help to accomplish that.


![ls -d.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/7oKBF8NCx.png align="left")

## List files and sort by date and time

To list files or directories and sort by last modified date, use the `-t` option.  To reverse the sorting order, use the -r parameter as follows: `ls -tr`:

![ls -t.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/x36ezXPGe.png align="left")

## Filtering Listing Output

As demonstrated in the examples, the ls command by default lists all non-hidden directory files.
This can be overkill at times, especially if you're only looking for information on a few files or even a single file. Fortunately, the ls command also allows you to specify a filter on the command line. The filter is used to determine which files or directories should be displayed in the output. The filter operates as a straightforward text-matching string. Include the filter after any command-line parameters that you intend to use:

![ls filter1.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/ESqsC6OZA.png align="left")

> Notice that we have just provided the filename as a simple text-matching string filter and as
expected ls provided us with the information of only that file.

When you specify the name of a specific file as the filter, the ls command only displays information about that file. You may not always know the exact filename you're looking for. The ls command also recognizes and uses standard wild card characters to match patterns within the filter:

- A question mark (?) to represent one character
- An asterisk (*) to represent any number of characters

I won't go over all meta-character wild cards in this article, but if you're curious, check out the video below :
[Linux Regular Expression Basics](https://www.youtube.com/watch?v=KJG1dETacLI)

The question mark can be used to replace exactly one character anywhere in the filter
string. For example:

![ls filter2.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/U3VWdqvm8d.png align="left")

You have noticed that the filter setup.sh matched one file. If there was another file with the name
secup.sh (notice the difference), the filter setup.sh would have matched the two files. Here is an
example:

![ls filter3.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/-tnPXyqKv.png align="left")

As expected, our filter matched the two files. Similarly, the asterisk can be used to match zero or more
characters. Here is an example:

![ls filter 4.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/bgQKMrLUx.png align="left")

**Quick Tip:** You can place the asterisk or the question mark anywhere in your filter.

> Using the asterisk and question mark in the filter is called file globing. File globing is the processing of
pattern matching using wild cards. The wild cards are officially called "meta-character" wildcards. You
can use more meta-character wildcards for file globing than just the asterisk and question mark. 

You can also use brackets as shown below:

![ls filter 5.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/-fd8eUvQB.png align="left")

In this example, we used the brackets along with two potential choices for a single character in that
position, t or c. The brackets represent a single character position and give you multiple options for file globing. You can also specify a range of characters, such as an alphabetical range [a -t] :

![ls filter 6.png](/img/blog/everything-you-need-to-know-about-the-linux-ls-command/jxw-qQcIn.png align="left")

File globbing is such a broad topic that it deserves its own separate article to explain each metacharacter. When searching for files, file globing is a useful feature. It can also be used with other shell commands besides ls, such as grep, cut, tr, sed, gawk, rm, cp, and so on. You'll learn more about this in our future articles.

## Conclusion

There are numerous other commands and combinations you can use to list files and directories based on your requirements. One thing to keep in mind is the ability to combine multiple commands at once.

If you forget a command or are unsure what to do, type `ls --help` or use the ls man pages (`man ls`, which will display a manual with all possible ls options.)

Thank you for making it this far & hopefully you found this article helpful. Feedback is really appreciated 💜

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.

I can be found **[@xtremepentest](http://twitter.com/xtremepentest)**  on Twitter, or **[LinkedIn](https://www.linkedin.com/in/0xtraw/)**.








