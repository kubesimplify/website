# 🤔 How to Contribute ?

### 1.) Fork The Repo

Click on **Fork** button present on the upper-right area of the screen to create a copy of this repository to your GitHub account.
[fork](https://github.com/kubesimplify/website)
 

### 2.) Clone The Repo
-> You can clone this branch to your machine by using the below command.

```bash

git clone -b development https://github.com/<YOUR_USERNAME>/website-1.git

```

-> Navigate to your repo

```bash

cd website-1

```

-> Install dependencies 

```bash

npm install

```

### 3.) Setup Remote

```bash

git remote add upstream https://github.com/kubesimplify/website.git

```
To verify 
```bash

git remote -v

```
You will get output similar to this
```bash

origin  https://github.com/<YOUR_USERNAME>/website-1.git (fetch)
origin  https://github.com/<YOUR_USERNAME>/website-1.git (push)
upstream          https://github.com/kubesimplify/website.git (fetch)
upstream          https://github.com/kubesimplify/website.git (push)

```

### 4.) Contributing & PR

1. Create a new branch.

```
git checkout -b <your_branch_name>
```

2. Perform your desired changes to the code base.

   Make sure to run ```npm run format ``` 

3. Track your changes:heavy_check_mark: .

```
git add .
```

4. Commit your changes
```
git commit -m "Relevant message"
```

5. Push the committed changes in your feature branch to your remote repo.

```
git push -u origin <your_branch_name>
```

5. To create a pull request, click on `compare and pull requests`. Please ensure that you compare your feature branch to the desired branch `development` of the repo to make a PR (Pull request).


6. Add an appropriate title and description to your pull request explaining your changes and efforts done. And edit the PR template

7. Click on `Create Pull Request`.


## PR Review
Your PR will get reviewed soon from the maintainers of the project. If they suggest changes, do all the changes, commit the changes, rebase the branch, squash the commits and push the changes. If everything looks good, your PR will be merged. That's it! Thank you for your contribution! Feel free to suggest any changes to this documentation.