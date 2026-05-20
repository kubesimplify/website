---
title: "Get Good At Git 💎"
seoTitle: "Get good at Git"
seoDescription: "This blog covers advanced git techniques and shortcuts. It breaks down advanced Git commands that everyone should know."
datePublished: 2022-05-04T12:28:54.047Z
slug: get-good-at-git
author: bushra-nazish
cover: /img/blog/get-good-at-git/HAgkEjvqA.jpeg
tags: ["github", "git", "devops", "advanced", "technical-writing-1"]
cuid: cl2rk33iu003wdmnvfv6ndai6
---
One of the best pieces of advice, one would ever get is "Get good at Git". Git was created by Linus Torvalds, a guy much smarter than us. He knew if he made it too easy, it would make us weak. Instead, he wanted to give us a glory of overcoming the challenge.


![git man-weight-lifting.png](/img/blog/get-good-at-git/G3iYXzyFX.png)

Could you be using Git more efficiently? The answer is, probably, a YES.

In this blog, we will look at a bunch of different tips and tricks to make you more productive with Git 📝

## Combine ADD and COMMIT

To save a snapshot of your code, you use "add" followed by a commit message.
```
git add .
git commit -m "New line added"
```
But, there's an actually a better way to get the job done.

You can go straight to commit by using the `-am` flag.
```
git commit -am "An easy way!"
```
This will automatically add all the files in the current working directory.

## Aliases 😇

There's actually a more concise way to get the job done.

The command `git config` provides a way to create aliases which are commonly used to shorten an existing command or create your own new custom commands.

Let's look at an example:
```
git config --global alias.ac "commit -am"
git ac "noice!"
```
We made an alias called `ac` that runs the "add" and "commit" command with just two letters. 

This allows us to run things faster, but sometimes going fast leads to mistakes.

## Amend

What if you made a typo in your last commit message - `git ac "noice!"`❓


![Screenshot (290).png](/img/blog/get-good-at-git/rcltfQDF9.png)

Instead of resetting and committing a new commit, the `--amend` flag followed by a new message will simply update the latest commit.
```
git commit --amend -m "nice!"
```
Or maybe you forgot to include or stage a couple of files with your last commit.
You can also update your last commit with new files by using the `--amend` flag. 

And if you want to keep the same commit message, add the `--no-edit` flag as well. 
```
git add .
git commit --amend --no-edit
```


## Force Push 😧

Keep in mind, the above command only works when you haven't already pushed your code to a remote repository.

Unless you like to live dangerously, in which case, you can do a "git push" with the `--force` flag. 
```
git push origin master --force
```
This will overwrite the remote commit with the state of your local code.

However, if there are commits on the remote branch that you don't have, you'll lose them forever. 


## Revert 

But what happens if you push some code to a remote repository and then realize it's a complete garbage and never should've been there in the first place.

Git `revert` command allows you to take one commit and go back to the state that was there previously.
```
git revert better-days
git log --oneline
```

![Screenshot (291).png](/img/blog/get-good-at-git/W05yq2ZSE.png)

We will use the "revert" command with the hash id of the latest commit.
```
git revert b4f4098
```
It's kind of like an undo but doesn't remove the original commit from the history. Instead, it just goes back to the original state.


![Screenshot (292).png](/img/blog/get-good-at-git/B69L7SQWO.png)

And, that's much easier 👍


## Codespaces

Another case is, you may need to work on a repository but not have access to your local machine.

If you are in your Grandma's house without your laptop, you can use any computer that has a web browser.

> Go to the GitHub and find the repository that you want to want to work on.
Then hit the period key on your keyboard.


![Screenshot (273).png](/img/blog/get-good-at-git/_Z9Bk5ebx.png)

And like magic, it pulls up a browser-based version of VS Code where you can make edits, submit pull requests and do almost anything else you could do locally, well except for run the terminal. 

If you do need to run terminal commands, you can setup a GitHub code space in the cloud which will give you the full power of VS Code and is, likely, much faster than your Grandma's computer.

## Stash

Let's switch gears to Git stash.

Have you ever spent time working on some changes that almost work, but they can't really be committed yet? 

`git stash` will remove the changes from your current working directory and save them for later use without committing them to the repo.

The simple way to use it is, 
```
git stash
git stash pop
```
when you're ready to add those changes back into your code.

But if you use the command a lot, you can use `git stash save` followed by a name to reference it later.
```
git stash save coolstuff
```
Then when you are ready to work on it again, use `git stash list` to find it and then `git stash apply` with the corresponding index to use it.
```
git stash list
git stash apply 0
```
Now if you want to use a "stash" at Grandma's house, you have now a solution 😉

You can use a GitHub codespace in which case, your stashes would be saved in a file.

That's pretty cool!

![Codespace.webp](/img/blog/get-good-at-git/XZBu8ENOL.webp)


## PC Master Branch

Now, I have a public service announcement for developers in the modern era.

Historically, the default branch in git is called the "master" branch, which is now referred to as "main", "mega" or "mucho". 

![Master branch git 1.png](/img/blog/get-good-at-git/AKDLYtZzm.png)
 
To change it, use "git branch" followed by the `-M` flag to rename it to main, or maybe get creative and invent your own name.
```
git branch -M mucho
```

## Pretty Logs

Another command, you might be probably familiar with, is `git log` to view a history of commits.
The problem with this command is that the output is harder and harder to read as your project grows in complexity.

To make the output more readable, add the options of `--graph`, `--oneline` and `--decorate`.
```
git log --graph --oneline --decorate
```
You can now see a more concise breakdown and how different branches connect together.


![Screenshot (274).png](/img/blog/get-good-at-git/YWLBB2NH_.png)

But if you're looking at the "git log", there's likely a commit in there that's currently breaking your app ;)


## Searching Logs 🔍

The `log` command can also be used to search for specific changes in the code. 

For example, you can search for the text **README file added in Kubesimplify** as follows.
```
git log -S "README file added in Kubesimplify"
```
This command returns the commit where the file is added in the Text directory.

## Bisect

Git bisect allows you to start from a commit that is known to have a bug, likely the most recent commit.

But if you knew that the app was working a few hours ago, you can point bisect to the last working commit.
```
git bisect start
```
Then, it performs a binary search to walk you through each commit in between.

![git bisect.png](/img/blog/get-good-at-git/DyOfiV0hB.png)

If the commit looks good, type `bisect good` to move on to the next commit.
```
git bisect bad
git bisect good 5b010ef
git bisect bad
```

Eventually, you will find the bad one and know exactly which code needs to be fixed.

## Autosquash

Another advanced git technique that every developer should know is how to squash their commits.


![git squash.png](/img/blog/get-good-at-git/TRpN0rhed.png)

Imagine, you are working on a feature branch that has three different commits. And you are ready to merge it into the master branch.


![Screenshot (275).png](/img/blog/get-good-at-git/ptUEQMUb7.png)

But all these commit messages are kind of pointless, and it would be better if it was just one single commit.


![Screenshot (276).png](/img/blog/get-good-at-git/e_ryRP3Tm.png)


We can do that from our feature branch by running "git rebase" with the `--interactive` option for the main branch.
```
git rebase master --interactive
```
This will pull up a file with a list of commits on this branch.


![Screenshot (277).png](/img/blog/get-good-at-git/gy6ts3_qY.png)

If we want to use a commit, we just use the `pick` command.

We can also change a message using `reword` command.

Or we can combine or squash everything into the original commit using `squash` command.


![Screenshot (279).png](/img/blog/get-good-at-git/wn4LdsjG7.png)

Go ahead, save the file and close it.

Git will pull up another file prompting you to update the commit message, which by default will be a combination of all the messages that you just squashed.


![Screenshot (280).png](/img/blog/get-good-at-git/Dfbj4-SBC.png)

And if you don't like all the messages combined, you can use "fixup" instead of "squash" when doing the rebase.

To be even more productive, you can also use `--fixup` and `--squash` flags when making commits on your branch.
```
git branch --fixup fb2f677
git command --squash fc2f55
```
On doing this, it tells git in advance that you want to squash them. 

So when you go to do a rebase with the `--autosquash` command, it can handle all the squashing automatically.

```
git rebase -i --autosquash
```

## Hooks 🔌

Now, if you maintain a repo, one tool that can be very helpful is "Git hooks."
```
git commit -m "It is fixed"
```
Whenever you perform an operation with git like a commit for example, it creates an event. 

And hooks allow you to run some code either before or after that event happens.

If you look in the hidden git directory, you will see a directory called "hooks". And inside it, you will find a bunch of different scripts that can be configured to run when different events in git happen.


![Screenshot (285).png](/img/blog/get-good-at-git/b006l5HXG.png)

> If you happen to be a JavaScript developer, there's a package called "husky" that makes it much easier to configure git hooks.


![Screenshot (286).png](/img/blog/get-good-at-git/sPd3Ltdm2.png)

For example, You might install it with npm, then create a script that will validate or link your code before each commit. And that can help improve your overall code quality.


![Screenshot (287).png](/img/blog/get-good-at-git/d9MVglzom.png)


## Destroy Things 💥

To wrap things up, let's talk about deleting things.

Let's imagine you have a remote repository on GitHub than a local version on your machine that you have been making changes to. But, things haven't been going too well. 


![Screenshot (288).png](/img/blog/get-good-at-git/-Xs5E1mRG.png)

And you just want to go back to the original state in the remote repo.
```
git fetch origin
git reset --hard origin/master
```
First, we do `git fetch` to grab the latest code in the remote repo.

Then, use reset with the `--hard` flag to override your local code with the remote code.

- Be careful, your local changes will be lost forever.

But you might still be left with some random untracked files or build artifacts here and there.

Use the `git clean -df` command to remove those files as well.

If you want to get rid of it altogether, maybe you want to try out Apache subversion to change things up a bit.

All you have to do is, delete that hidden git folder, and you are on your own again.

![Screenshot (289).png](/img/blog/get-good-at-git/FhfyfCpE9.png)

## Checkout to Last

Oh! There's one other tip that comes in really handy.
  
If you recently switched out of a branch and forgot its name, you can use:
```
git checkout -
```
It takes you directly back to the previous branch that you were working on.


## Conclusion

Hopefully, a few of these commands can help you in your Git journey. There are many other amazing Git commands- Explore and Learn!

If you have any additional Git tips, make sure to leave them in the comments.



*If you are unfamiliar with the basics of Git, click on [Kunal Kushwaha's Git Tutorial video](https://www.youtube.com/watch?v=apGV9Kg7ics&t=303s&ab_channel=KunalKushwaha)*

*Source of the blog: [ Fireship video](https://www.youtube.com/watch?v=ecK3EnyGD8o&t=398s&ab_channel=Fireship)*


🤝**Let's Connect [here](https://linktr.ee/BushraNazish) and Learn Together**

> Do Follow Kubesimplify for more awesome blogs 🙋








