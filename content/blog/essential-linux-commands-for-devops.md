---
title: "Essential Linux Commands For DevOps"
seoTitle: "Essential Linux Commands For DevOps"
datePublished: 2022-08-18T12:31:00.864Z
slug: essential-linux-commands-for-devops
author: bishal-das
cover: /img/blog/essential-linux-commands-for-devops/gaW2HISUK.jpg
tags: ["linux", "devops", "linux-basics", "linux-commands"]
cuid: cl6z0u40p0019binv49xx9gw5
---
Most input lines entered at the shell prompt have three basic elements:-
  - Command
  - Options
  - Arguments

The command is the name of the program you are executing. It may be followed by one or more options (or switches) that modify what the command may do. Options usually start with one or two dashes, for example, -p or --print, in order to differentiate them from arguments, which represent what the command operates on.
However, plenty of commands have no options, no arguments, or neither.


### List Of Some Basic Commands:-
- `ls` → Use to see all the list of files or folders inside a directory
- `ls -a` → list of all the files and folders including **hidden files & folders**
- `ls -l` → Use to see all the files and folders including file permissions as well
- `ls -al` → combine the above two commands - hidden files and folders + details 
- `ls -R` → show all the sub directory of a directory
- `cd <directory name>` → it is used for changing from any directory into another directory
- `cd..` → go back to previous folder
- `cd -` → change to previous directory
- `cd ~` → go back to home directory
- `pwd` → print working directory or present working directory
- `man <command>` → describes the manual about any command
- `.` → the current directory
- `..` → the previous directory
- `cat <filename>` → Use to show the content of any file quickly in the terminal
- `tac <filename>` → Use to look at a file backwards, starting with the last line.
- `cat > <filename>` → quickly create a file of given filename and add some content in it.

   - `>` → **Redirection command:** redirect the output to some other file

- `cat file1 file2 > file3` → concatinate the content of file1 and file2 and paste that merged content into file3
- `echo` → Use to print anything in the terminal
- `echo "something" > filename` → add the text into the mentioned file
- `tree` → displays a tree view of the filesystem

---

### Commands for Working with File system :-
- `mkdir <dir name or path>` → Use to create any new directory

    - **`mkdir sampdir`**
        - It creates a directory named **sampdir** under the current directory.
    - **`mkdir /usr/sampdir`**
        - It creates a directory called sampdir under /usr directory.
- `mkdir -p dir1/middle/dir2` → creating a directory in the middle of `dir1` & `dir2`
- `rmdir <dir name>` → Removing a directory is done with rmdir. The directory must be empty or the command will fail
- `rm -rf <dir name>` → To remove a directory and all of its contents recursively, it is extremely dangerous and should be used with the utmost        care (-rf means forcely remove)
- `rm -f` → Forcefully remove a file
- `touch <filename or path>` → create a new file
- `cp <filename> <new filename>` → Use to make a copy of a file
     
     - `cp file1 file2` → It will make a copy of **file1** and naming that **file2**

- `mv <filename> <location>` → To move a file to a new location

    - can also be used to rename a file
    - `mv <filename> <newfilename>`
    
         - `mv files.txt newfile.txt` → Here **files.txt** will be moved to **newfile.txt** but **newfile.txt** 
             does not exist for the first time. So, **files.txt** will be moved and also renamed as 
             **newfile.txt**
- `locate "file extension"` → locates all the files with the same extension as mentioned

    - Example:
      ```bash
      locate "*.txt"
      ```
- `sudo` → super user do (it provides the administrative permissions). It always ask for sudo password because it is kind of admin control command.
- `df` → it shows disk space usage in **kb** but if we write `df -m` then it will show usage in **mb**
      
     - `df -h` → -h is a flag which means **human readable format**
- `du` → it shows disk usage statistics. It also has flag `du -h` means in **human readable format**
- `head <filename>` → It prints by default first 10 lines of the given file

     - `head -n 4 <filename>` → will only display the first 4 lines.
- `less` → Used to view larger files because it is a paging program. It pauses at each screen full of text, provides scroll-back capabilities, and    lets you search and navigate within the file.
- `tail` → Used to print the last 10 lines of a file by default

    - `tail -n 5 <filename>` → will display the last 5 lines.
- `diff file1 file2` →  compares both the files & print the uncommon lines
- `find` → find things in a file or a directory

     - `find /usr -name gcc` → Searching for files and directories named gcc
     - `find /usr -type d -name gcc` → Searching only for directories named gcc
     - `find /usr -type f -name gcc` → Searching only for regular files named gcc
     - `find -name "*.swp" -exec rm {} ’;’` → To find and remove all files that end with ".swp". The {} (squiggly brackets) is a placeholder that           will be filled with all the file names that result from the find expression, and the preceding command will be run on each one                     individually. you have to end the command with either ‘;’ (including the single-quotes) or "\;"
     - for more flags check `man find`

---

### File Permissions Commands:-
- There are three types of permission:
    - read (r)
    - write (w)
    - execute (x)
    - These are generally represented as in **rwx**
  
- These permissions affect three groups of owners:
    - user/owner (u)
    - group (g) → an entity among a user group
    - guests or the other people (o) 

- `ls -l <filename>` → shows the file permissions for that particular file

    - Example:-
          
           ls -l myfile.txt
         
           -rw-r--r-- 1 bishal bishal 98 May  4 23:07 myfile.txt
           
      ![](https://www.pluralsight.com/content/dam/pluralsight/blog/2011/12/linux-file-permissions/wp/img/Linux-File-Permissions-2.jpg)
- Changing the file permissions
     
     1. using `chmod` command
  
        ```bash 
        chmod u=rwx,g=rx,o=rw <filename>
        ```
  
        - changes made here:
            - User: `rwx`
            - Group: `rx`
            - Other: `rw`
     2. Using octal numbers with `chmod`
        - `chmod 777 <filename>`
            - `777` → -rwx all three permission fully accessable for user,group & others.
        - Categories
            - `4` → if read permission is desired
            - `3` → if write permission is desired
            - `1` → if execute permission is desired.
            - `0` → no permission
            - (Thus, 7 means read/write/execute, 6 means read/write, and 5 means read/execute.)
           
            - Example:-
              ```bash
               chmod 577 myfile.txt
              ```
              (Here **User** have read and execute permission only as 5 and group,others have all 
               permission as it's 77)
- Changing the users of a file
    - `chown` command
        
        ```bash
        sudo chown root <filename>
        ```
    
        - we have to use `sudo` as we are accessing `root` permissions
        - `root` user has the highest number of permissions in linux/unix based systems

---
              
- grep command
    - Global regular expression print
    - Allows to search some text in files
    - Case sensitive
        - Versions of grep:
        
        ```bash
        grep -V
        ```
        
        - **Mac** → BSD grep
        - **Linux** → GNU
    1. Simple searching a word
        
        ```bash
        grep "bishal" names.txt
        
        **bishal**
        ```
        
        - If present, it will return the string itself!
    2. Expanding the whole word
        
        ```bash
        grep -w "bishal" names.txt
        
        **bishal** das
        ```
        
        - Using `-w` (means word-regexp), we searched for the “bishal” & it returned the whole string associated with that word!
    3. To ignore the search case-sensitivity
        
        ```bash
        grep -i "bishal" names.txt
        
        **bishal** das
        ```
        
    4. Print the line number of the word
        
        ```bash
        grep -n "bishal" names.txt
        
        1:bishal das
        ```
        
    5. Print lines after & before the word
        
        ```bash
        grep -B 5 "bishal" names.txt
        
        Carlos santana
        Ishan kurnawat
        Micheal cade
        John irshad
        Arsab roy
        **bishal** das
        ```
        
        - `-B 5` → means print 5 lines before the actual word we are searching
        
        ```bash
        grep -A 5 "bishal" names.txt
        ```
        
        - `-A 5` → means print 5 lines after the actual word we are searching
    6. To search the entire directory for a word
        
        ```bash
        grep -win "bishal" ./*.txt
        ```
        
        - This will check all the `.txt` files in the current directory for the word (-w/-i/-n all flag together = win)
    7. Which file contains a match and count all file
        
        ```bash
        grep -wirl "bishal" .
        ```
        
        - using the `-l` tag here, we found the list of file that contained “bishal” in the current directory
        
        ```bash
        grep -wirc "bishal" .
        ```
        
        - using the `-c` tag here, we count the list of file that contained “bishal” in the current directory
    8. Using `regex` to search
        - Regular expression commands
        - **Come back to it later**

---

- Using your own command
   - Steps :-
     - open **.bashrc** file with any editor vim/gedit by `vi .bashrc` or `gedit .bashrc` command
     - add your customized command at the last line or anywhere of that **.bashrc** file and save the file.
     ```bash
     alias gpom = 'git push origin main'
     ```
     - then execute this command `. ~/.bashrc` in your terminal (home directory) 
     - your alias command is successfully updated in **.bashrc** file
     - now you can use "gpom" command very easily
 
---
               
- **Useful terminal shortcuts**
    - `history` command
        - shows a history of all the commands you ran in that particular session
        - to directly use a command from history
        
        ```bash
        !<history-number>
        ```
        
    - `ctrl + A` → Cursor goes to the begining
    - `ctrl + e` → Cursor goes to the end
    - `ctrl + k` → after cursor all will be deleted
    - `ctrl + u` → entire command will be deleted
    - `ctrl + r` → search previous command
    - `;` → to use multiple commands in the same line
    
    ```bash
    git add .;git commit -m "message";git push origin main
    ```
    
---

- `ping <URL>` → to check the connectivity status of a website by sending packets (ping - Packet Internet Groper)
- `wget <URL>` → to download any file from the internet
    - you’ll have to install this using your package managers
        - `apt install`
        - `brew install`
        - `yum install`
- `top` → process running + CPU usage
    - `kill <process_id>` → to stop a running process
- `uname` → prints out your OS name
    - has many tags associated
- `zip & unzip`
   - `zip details.zip name.txt phone.txt` → create a zip file named "**details.zip**" and zipped two files "name.txt" & "phone.txt" into                 "details.zip"
   - `unzip details.zip` → it will unzip "**details.zip**"
    
- `hostname` → prints the host’s name
- `hostname -i` → ip address of host
- `nslookup <URL>` → checkout ip address of a domain
- `netstat` → show all the ports
- `ps aux` → showing all the running processes with PID
- `vmstat` → checking your virtual memory
- `id` → to check user & group id’s
- `getent` → if a particular user exists or not
- `lscpu` → all details of cpu
- `lsof` → list all the open files

---

### Working with Operators:-

- Combining various commands together
1. `&` operator
2. `&&` operator
    
    ```bash
    echo "first" && echo "second"
    ```
    
    - only when the `first` command is completed, then the `second` will run
3. `;` operator
4. `||` operator (OR)
5. `|` operator (pipe)
6. `!()` operator (NOT)
7. `>` → over-write
8. `>>` → append
    
    ```bash
    echo "hey" >> names.txt
    ```
    
9. `{}` → combination operator

---
Thanks! for reading this blog :)

Hope this blog will help you!👍

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.