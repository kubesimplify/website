---
title: "12 Practical Grep Command Examples In Linux"
seoTitle: "12 Practical Grep Command Examples In Linux"
seoDescription: "In Linux command line, the grep command is a powerful tool for searching text within files."
datePublished: 2022-12-06T12:30:42.421Z
slug: 12-practical-grep-command-examples-in-linux
author: sysxplore
cover: /img/blog/12-practical-grep-command-examples-in-linux/7aw9_K0pO.png
tags: ["ubuntu", "linux", "bash", "basics", "archlinux"]
cuid: clbc79f0s076rycnv4r5v2o7k
---
In Linux command line, the grep command is a powerful tool for searching text within files.

In this article, I will go over 12 examples of grep command usage that every Linux user, sysadmin, and developer should be aware of.

## What it is the Grep command on Linux?

If you're wondering what grep stands for, it stands for global regular expression print. You can use grep to search through files, or use it in conjunction with pipes or other commands to filter the output of another command. You'll find the grep command very useful in your day-to-day work as a sysadmin or Linux user once you've mastered it.

The syntax of the grep command is very simple:

```
$ grep [OPTION...] PATTERNS [FILE...]
``` 

In this article, I will use a file called 'linuxquotes.txt' to demonstrate how to use the commands. If you want to follow along, you can find the contents of the file [here](https://pastebin.com/tJTsJvgn) :


![1-grep-file-contents.png](/img/blog/12-practical-grep-command-examples-in-linux/6cgWKXVJX.png align="left")

## Grep command examples

Now that you know what grep is, let's look at some examples.

### 1. Finding all occurrences of a string in the given file.

In this example, we tell grep to look for the word "Linux" and provide the file to look into as an argument. If the string you want to search contains spaces, you must surround it with quotes:

```
┌──(traw㉿kali)-[~/articles]
└─$ grep "Linux" linuxqoutes.txt
``` 

![2-example-1.png](/img/blog/12-practical-grep-command-examples-in-linux/4hBziw5OM.png align="left")

### 2. Finding all occurrences of a string in multiple files.

We can also instruct grep to search multiple files for a specific string. The following example demonstrates this clearly:

```
┌──(traw㉿kali)-[~/articles]
└─$ grep "Linux" linuxqoutes.txt learnlinux.txt 
``` 
![3-grep-example-3.png](/img/blog/12-practical-grep-command-examples-in-linux/IPAk6lk1x.png align="left")

Notice, the grep command does a good job of specifying the file in which it finds a specific match. This is why the grep command is so useful for searching for strings in files.

### 3. Filtering or Searching output of another command

Grep can, as previously stated, be used to filter or search the output of another command. This is made possible by making use of the command line chaining operator pipe (|).

```
┌──(traw㉿kali)-[~/articles]
└─$ head -n 12 linuxqoutes.txt | grep "Linux"
```

![4-grep-example-4.png](/img/blog/12-practical-grep-command-examples-in-linux/MgPgosrDq.png align="left")

### 4. Display Line Numbers Containing Matches  

Using the -n option in conjunction with grep, it will display the line numbers containing matches as well as their respective matches:

```
┌──(traw㉿kali)-[~/articles]
└─$ grep -n "Linux" linuxqoutes.txt
``` 

![5-grep-example-5.png](/img/blog/12-practical-grep-command-examples-in-linux/DoJs3AvXg.png align="left")

### 5. Making grep search case insensitive

Grep search is case sensitive by default. If you want the search to be  case insensitive you can use -i option.

```
┌──(traw㉿kali)-[~/articles]
└─$ grep -i "LINUX" linuxqoutes.txt
```

![6-grep-example-6.png](/img/blog/12-practical-grep-command-examples-in-linux/m4r4muvtU.png align="left")

In the preceding example, we searched for the word "LINUX" and grep returns the words Linux and LINUX as matching.

### 6. Using regular expressions with grep

The search string can be a regular expression, which makes grep quite strong. However, I will not go into detail on how to use regexp with grep in this article.

The following example will search for lines which contains any digits from 0 up to 9.

```
┌──(traw㉿kali)-[~/articles]
└─$ grep "[0-9]" linuxqoutes.txt
```

![7-grep-example-7.png](/img/blog/12-practical-grep-command-examples-in-linux/0NaNkw8dm.png align="left")

You can boost the power of your search by employing a regex pattern. There are special grep options that allow you to use a regex pattern.

- e - enables the use of regex patterns.
- E - enables the use of extended regex patterns.
- G - enables the use of basic regex patterns.
- P - enables the use of perl regex patterns.

Here, we used extended regular expressions to search for a word which starts with any characters (*) and ends with (sh). 


```
┌──(traw㉿kali)-[~/articles]
└─$ cut -d ":" -f 7 /etc/passwd | grep -E "*sh$"
```

![8-grep-example-8.png](/img/blog/12-practical-grep-command-examples-in-linux/_SAO2V_aB.png align="left")

Notice, if we don't use the "-E" option grep won't display anything, this shows that without the "-E" parameter grep command won't recognize the provided pattern.

### 7. Displaying all the lines that DO NOT match a given pattern.

Another thing you might find useful is to use the "-v" option to reverse the result, eliminating all the lines that match a specific search string:

Here we eliminated lines which do not contain the word "Linus Torvalds":

### 8. Combining grep options

Grep, like any other Linux command, can combine several options to perform multiple tasks at once. In this case, we combined the -v and -i options to instruct the grep command to be case-insensitive with the pattern and to only display lines that DON'T match that given pattern:

```
┌──(traw㉿kali)-[~/articles]
└─$ grep -vi "Linux" linuxqoutes.txt
```

![10-grep-example-10.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1669664894903/SQK8enLi2.png align="left")

### 9. Find Exact Match Words.

If you search for the phrase 'Lin,' grep will also return lines containing the words 'Linux' or 'Linus.' 


![11-grep-example-11.png](/img/blog/12-practical-grep-command-examples-in-linux/Hq0MaKfAE.png align="left")

Fortunately, grep has option "-w"  which allows it search and match the exact whole words only. In this case grep didn't find any match because the file "linuxqoutes.txt" doesn't contains the word "Lin".

```
┌──(traw㉿kali)-[~/articles]
└─$ grep -w "Lin" linuxqoutes.txt
```

![12-grep-example-12png.png](/img/blog/12-practical-grep-command-examples-in-linux/6XeiC8SrE.png align="left")

### 10. Searching in all files recursively

With the grep option "-r", you can execute a recursive search. It will look for the specified pattern in all files in the current directory and its sub-directories. Notice, I tacked "-i"  with "-r option" to make the search case insensitive:

```
┌──(traw㉿kali)-[~/articles]
└─$ grep -ir "linux"
```

![13-grep-example-13.png](/img/blog/12-practical-grep-command-examples-in-linux/ihBpH-dCI.png align="left")

### 11. Print only names of FILEs with matching lines

Grep displays the matching lines by default. If you only want to know which files contain the string, use the following grep options:

- r - recursively search every file in the current dir
- l - print only names of FILEs with matches
- i - this option is optional, I have added it since I want my search to be case-insensitive:

```
┌──(traw㉿kali)-[~/articles]
└─$ grep -irl "linux"
```

![14-grep-example-14.png](/img/blog/12-practical-grep-command-examples-in-linux/9fNLvZF7G.png align="left")

### 12. Print only names of FILEs with no matching lines

If you only want to know which files do contain the string, use the following command:

-r - recursively search every file in the current directory.
-L - print only names of FILEs without the matching lines.

```
┌──(traw㉿kali)-[~/articles]
└─$ grep -rL "Ubuntu" 
```

![15-grep-example-15.png](/img/blog/12-practical-grep-command-examples-in-linux/kLPBjYAHb.png align="left")

### Bonus

To help you remember grep commands while using Linux, I have made this cheatsheet. So feel free to [download](https://github.com/0xTRAW/Grep-Cheatsheet) and save it for quick reference.

![grep cheatsheet.png](/img/blog/12-practical-grep-command-examples-in-linux/WSwj1pE-L.png align="left")


## Conclusion

Those were some straightforward grep examples. If you read the man page for this command, you'll notice that it has a plethora of additional parameters and uses. This information should be sufficient to help you understand the Linux grep command and how to use it.

That's all! 
Thank you for getting this far. I hope you find this article useful. If you did found this article valuable: 

- Toss us a follow for more amazing articles on Linux, sysadmin and security 

And be sure to share with other Linux folks who you think it might be useful to them.

Like the blog? Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [LinkedIn](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.












