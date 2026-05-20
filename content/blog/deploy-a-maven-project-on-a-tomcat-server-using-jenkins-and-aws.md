---
title: "Deploy a Maven Project on a Tomcat Server Using Jenkins and AWS"
seoTitle: "Deploy a Maven Project on a Tomcat Server Using Jenkins and AWS"
seoDescription: "Deploy a Maven Project on a Tomcat Server Using Jenkins and AWS"
datePublished: 2023-02-19T12:30:39.367Z
slug: deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws
author: kanika-gola
cover: /img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/53718f44-a049-4569-83a5-d8b72c00a530.jpeg
tags: ["aws", "maven", "devops", "jenkins", "tomcat"]
cuid: clebda8pu015ooknv12o127bu
---
In this blog, we are going to create a simple job that will deploy a Maven project on a tomcat server built on an EC2 instance through Jenkins.

The steps that will be followed for this project are:

1. Create a security group for Jenkins.
    
2. Set up Jenkins on AWS EC2 instance.
    
3. Connect to Jenkins instance using SSH.
    
4. Install Jenkins on the EC2 instance.
    
5. Manage some Jenkins plugins
    
6. Create a security group for Tomcat.
    
7. Set up Tomcat on AWS EC2 instance.
    
8. Connect to Tomcat instance using SSH.
    
9. Install Tomcat on the EC2 instance.
    
10. Create a job for deployment
    

![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/231e2345-1298-41c5-9623-869536aea80b.png align="center")

<mark>NOTE</mark>: For setting up your AWS account, if you are using it for the first time, you can check out this video [https://youtu.be/FRQ9fE4fd5g](https://youtu.be/FRQ9fE4fd5g)

### Security Group for Jenkins

* Go to your [AWS Console](https://aws.amazon.com/free/?trk=09863622-0e2a-4080-9bba-12d378e294ba&sc_channel=ps&s_kwcid=AL!4422!3!453325184878!e!!g!!aws%20console&ef_id=Cj0KCQiAofieBhDXARIsAHTTldqlZvAK1aj-hlXzCN7Ue3nXRtZqPw73fcYXUhuZFxisksqbYlEVV9YaAkJUEALw_wcB:G:s&s_kwcid=AL!4422!3!453325184878!e!!g!!aws%20console&all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all) and sign in as an IAM user.
    
* I am choosing the region, ap-south-1 i.e the Mumbai region, which is present in the top right corner of the console, left to your account name.
    
* You can select from any of them mentioned.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/e2f97918-e04c-4b81-b72c-7ecdf9e76f0e.png align="left")
    
* Search for the service EC2 from the search bar.
    
* From the left toggle bar, search for “Security Groups”
    
* Create a Security Group and name it “Jenkins-Security-Group”
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/4ac53407-0328-4f8e-b154-cbc0c6029e79.png align="center")
    
* Let's add some Inbound rules
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/a3b6fcdf-a8de-4b8a-90f1-2bcc88208d31.png align="center")
    
    1. **First rule**: To allow SSH to your EC2 instance, you need to provide this rule by giving your IP i.e., “My IP” so that only you will be allowed to SSH.
        
    2. **Second Rule**: Next is Custom TCP with Port No. 8080 because our Jenkins server will run on this port.
        
    3. **Third Rule: The l**ast one is HTTP with port 80, to give general access to the Internet
        
* Now go ahead and click on create.
    

### Jenkins Server

* Search for the service EC2 from the search bar.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/0144917d-5449-4028-a534-417bacb609f9.png align="center")
    
* Click on 'Instances' from the toggle bar at the left.
    
* Now let's launch an instance by clicking on '<mark>Launch instances</mark>'
    
* Now, enter some details for your instance, name it 'Jenkins-Server'
    
* I am opting for Amazon Linux AMI here, you can use Ubuntu, macOS, Windows etc.
    
* **AMI**: An Amazon Machine Image (AMI) is a supported and maintained image provided by AWS that provides the information required to launch an instance.
    
* Make sure that the AMI you are opting for, lies in the free tier
    
* Choose the size of the instance t3. micro or anything that lies in the free tier.
    
* Let's create a key pair for your instance, naming it `Jenkins-Key` and downloading.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/be4bccfc-fa70-46d3-a199-eed989ebcd44.png align="center")
    
* Choose ".pem", if you are going to use SSH to connect to your instance, or ".ppk" if you are using putty.
    
* In network settings, select an “Existing Security Group”, which we just created “Jenkins-Security-Group” and then launch the instance.
    
* Wait for the Status Check to complete.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/cc8213db-d3af-413b-a996-893855549138.png align="center")
    

### Connect to the Jenkins Server using SSH

* Click on “Connect” and select the “SSH Client” option.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/c811951c-ad46-4f79-8ecc-33576fd7476a.png align="center")
    
* Move to the directory, where you have your downloaded key pair. Mine is in the downloads.
    
* Copy the third command and enter it in your terminal to ensure all permissions.
    
* And then, enter the command given under the example.
    
* Note: Make sure to enter the following command with a sudo prefix, if you haven't done `sudo su -` at the beginning.
    
    ```c
    sudo ssh -i "Jenkins-Key.pem" ec2-user@ec2-15-207-19-201.ap-south-1.compute.amazonaws.com
    ```
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/ba062a69-0b85-4a1a-8dc3-4c9314f89948.png align="center")
    
* Congratulations, you have connected to the instance🎉
    

### Install Jenkins on your Instance

* We are using `sudo` as a prefix with every command, you can also do `sudo -su` in the beginning to avoid that.
    
* Enter the command, for a quick update of all the software packages on your instance
    
    ```c
    sudo yum update –y
    ```
    
* Add the Jenkins repo
    
    ```c
    sudo wget -O /etc/yum.repos.d/jenkins.repo \
        https://pkg.jenkins.io/redhat-stable/jenkins.repo
    ```
    
* Import a key file from Jenkins-CI to enable installation from the package:
    
    ```c
    sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
    
    sudo yum upgrade
    ```
    
* Follow these commands
    
    ```c
    # install java
    sudo amazon-linux-extras install java-openjdk11 -y
    # install Jenkins
    sudo yum install jenkins -y
    # enable the Jenkins service to start at boot:
    sudo systemctl enable jenkins
    ```
    
* Start Jenkins as a service
    
    ```c
    sudo systemctl start jenkins
    ```
    
* Check the status
    
    ```c
    sudo systemctl status jenkins
    ```
    

![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/8a17a84b-d5bf-4636-878f-a47be9e97b62.png align="center")

* Now copy the public IP address of the Jenkins instance, which is present in the details of the instance
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/7b5e28e8-6bdf-4ec7-a255-56f87cbaf13d.png align="center")
    
* Enter this IP address with the port number, i.e., "<mark>&lt;ip_address:port_number&gt;</mark>"
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/a5b1d3f0-6035-4d97-9359-1fde911d76aa.png align="center")
    
* Now, get the password by entering the following command and enter it in the text box
    
    ```c
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword
    ```
    
* Click on install the suggested plugins
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/5e440859-4bf1-48b1-8792-682c303d1d42.png align="center")
    
* Go ahead and enter your username and stuff as asked
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/3fd7d8ac-f9bb-4dc1-9334-c0d33b5e6be2.png align="center")
    
* You are ready to use Jenkins🎉
    
* <mark>NOTE:</mark> Some extra installations
    
    1\. Install git
    
    ```c
    sudo yum install git -y
    ```
    

2\. Install maven

```c
sudo wget https://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo

sudo sed -i s/\$releasever/6/g /etc/yum.repos.d/epel-apache-maven.repo

sudo yum install -y apache-maven

# check the installation
mvn --version
```

### Manage some Plugins in Jenkins

* Since we are deploying a maven project, go ahead and select “Manage Jenkins” from the left and then “Manage Plugins”.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/be2f57ba-6f81-4bcd-b385-059171cbae35.png align="center")
    
* Search for “maven” in the “available plugins” section and “install without restart”.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/5f90e425-1a89-4fcc-be7b-a202a3987343.png align="center")
    
* Install another plugin names “Deploy To container” for deployment
    
* This plugin allows you to deploy a war to a container after a successful build.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/52ceb372-a7c8-4461-a8b3-d2f656881095.png align="center")
    
* Next, go to Manage Jenkins&gt;Global Tool configuration&gt;Maven and opt for automatic installation
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/2605a731-010b-4a08-8fb4-8284b7eb986a.png align="center")
    

### Security Group for Tomcat

* Follow the same steps, as followed in creating a security group for Jenkins, with some minor changes.
    
* Give the name “Tomcat-Security-Group” to the security group.
    
* One inbound rule has to be changed
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/2b6b9538-2a6c-4278-a383-10884b957dc4.png align="center")
    
* We will use port no. 8090 for accessing it on the browser.
    
* And then “Create”🚀
    

### Tomcat Server

* Now let's launch an instance by clicking on '<mark>Launch instances</mark>'
    
* Enter the name “Tomcat-Server”
    
* Choose the Amazon Linux AMI.
    
* Select the size of the instance t3. micro or anything that lies in the free tier.
    
* Let's create a key pair for your instance, naming it 'Tomcat-Key' and download it.
    
* Choose “Tomcat-Security-Group”
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/448c9343-aa9b-4943-846c-b6d2aa85bcc7.png align="center")
    
* And “Launch” it 🎉
    

### Connect to the Tomcat Server using SSH

* Connect to it through SSH, following the same steps as followed in the Jenkins server by clicking on “Connect”.
    
* Here we can see both instances are running!
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/e2cd9d46-bd87-4697-b165-00c9ecbba5d5.png align="center")
    

### Install Tomcat on your Instance

* Go to [https://tomcat.apache.org/download-80.cgi](https://tomcat.apache.org/download-80.cgi) and copy the tar.gz file link.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/3e774026-480a-4b03-99f2-af802487ad06.png align="center")
    
* Move to the opt directory and download the tomcat package
    
    ```c
    cd /opt
    
    sudo wget https://downloads.apache.org/tomcat/tomcat-8/v8.5.85/bin/apache-tomcat-8.5.85.tar.gz.asc
    ```
    

![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/009ea706-33cd-4d39-bc43-d3d8b0207bc1.png align="center")

* Do `ls` in the opt directory to see the file, you will see the following file
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/a0013614-02da-4469-a242-debea95be43d.png align="center")
    
* Now we have to unzip and untar the package with a single command, i.e.
    
    ```c
    sudo tar -xvzf apache-tomcat-8.5.85.tar.gz
    ```
    
* Let's just rename the file as tomcat, so it will be easy for us to access it
    
    ```c
    sudo mv apache-tomcat-8.5.85.tar.gz tomcat
    ```
    
* Move into the file "apache-tomcat-8.5.85.tar.gz" and do `ls`
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/a17f8f20-a25c-4692-aa9d-34ce7cf8554b.png align="center")
    
* Now move to the bin folder
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/b16e1cd1-fb5a-4924-8a83-2adf599d6fa3.png align="center")
    
* Now the “startup.sh” is used for starting the tomcat server and “shutdown.sh” for shutting down.
    
    ```c
    ./startup.sh
    ```
    
* ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/b946e3f1-9d21-4d3e-83cd-d6b879c60a8f.png align="center")
    
* By default, tomcat will run on port 8080, we have to change it to 8090 by
    
    ```c
    cd /conf
    
    vi server.xml
    ```
    

![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/6b17d584-e078-4c3a-81eb-491ac8adcab4.png align="center")

* Change the connector port to “8090”
    
* Shut down the server by “./shutdown.sh” and then start again.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/1510e292-5f35-4401-8edc-b772879bdf9a.png align="center")
    
* Also, let's add some users to tomcat with different roles
    
* Do cd /conf and edit tomcat-users.xml
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/1d9e7b29-4473-43f8-b8e2-b7184a489e06.png align="center")
    
* Next thing is, we have to find the context.xml for solving this error when we click on manage App
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/3b60c0ac-baf5-4851-822f-dc6fdfad38a1.png align="center")
    
* This error comes because tomcat only allows access from the local system, but we want to access from outside as well
    
    ```c
    find / -name context.xml
    ```
    

![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/cf788a66-7a28-411f-9a56-53e59cdfa86a.png align="center")

* We will consider files that are under webapps.
    
* We have to comment out the valve command as it only allows access from local systems.
    
* Do the following with the last two files
    
    ```c
    vi /opt/apache-tomcat-8.5.85/webapps/host-manager/META-INF/context.xml
    
    vi /opt/apache-tomcat-8.5.85/webapps/manager/META-INF/context.xml
    ```
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/19bd9cd6-0ee1-4399-9363-d64868234f37.png align="center")
    

### Add tomcat credentials to Jenkins

* Go to Manage Jenkins&gt;Manage Credentials
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/bb72372f-a11d-462f-91bd-ff266637db36.png align="center")
    
* Click on “global Credentials” and then “Add Credentials”
    
* Remember, we added a user with a role in tomcat
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/fe5ca8ca-cf8f-4d56-abcf-614b2e58e95e.png align="center")
    
* Add the username and password as given and then create.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/0c7dea8e-f963-4784-92c3-596d613cf8c8.png align="center")
    

### Create a Job for deploying the Maven Project

* Click on “create a job”.
    
* Here is the [GitHub Link](https://github.com/Kanika637/maven-project) to the project we are using
    
* Fork the repo
    
* Enter a name for the project/job and select “maven project”
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/721d8072-b645-47d6-acee-9a4941691d05.png align="center")
    
* In the Source Code Management, choose git and enter the repository URL, by clicking on code
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/cf2ec99a-a44e-43eb-b831-a18ae491c459.png align="center")
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/09bf6e71-4fbf-4266-bbd1-6f590b340fed.png align="center")
    
* Since all the code is in the master branch in the given project, we will use the master branch.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/4186f7d7-9bff-4663-8336-21f672e17402.png align="center")
    
* Under the build section, we usually give these three options, i.e., "clean install package” with the pom.xml file already present there.
    
* **pom.xml** → It is an XML file that **contains information about the project and configuration details used by Maven to build the project**.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/0340969f-18dc-4bf4-9b1e-7c4d11170c39.png align="center")
    
* Now choose the option “Deploy war/ear to a container”
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/4e22cb38-9ce9-41ef-a98a-976205c24271.png align="center")
    
* Next, we have to specify the path of the war file, or we can just write “\*\*/\*.war” so that Jenkins will find the file having the type “.war” in that particular workspace.
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/8978e4d9-0c98-44f9-bb9a-10839cb1719e.png align="center")
    
* Now in the container section, choose tomcat with its latest version i.e., tomcat 9
    
* Also, choose the credentials from the dropdown that we just created, i.e., deployer
    
* Next, copy the URL of the tomcat server, on which you can access it from the browser
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/6062d8b6-fbfe-46d2-a83b-d8ea12b2b71d.png align="center")
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/0894dfe8-7e01-488c-9b56-14138443ba5f.png align="center")
    
* Now save and click on “Build Now”
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/6ffe6686-86ef-4568-8a12-0199470be27d.png align="center")
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/7b11fe81-d55e-49ad-9108-629e7a654267.png align="center")
    
* Yay! 🚀 that's a SUCCESS!
    
* This is where your war file will be copied, i.e., in the webapps directory
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/9150aa98-236c-4b2b-8489-b1878d63e53d.png align="center")
    
* Now we can access our app on the browser by adding "/webapp" in the URL
    
    ![](/img/blog/deploy-a-maven-project-on-a-tomcat-server-using-jenkins-and-aws/b0407fdc-492e-4e23-b3f4-248d46b1cb86.png align="center")
    
* So whatever was written in the index.jsp will be visible here!
    
* You have successfully deployed a maven application to a tomcat server🎉
    

Don't forget to like and share this post. Connect with me on [**Twitter**](https://twitter.com/gola_kanika). Follow me for more such blogs on [**Hashnode**](https://hashnode.com/@Kanika26).

Follow Kubesimplify on [**Hashnode**](https://blog.kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify), Instagram and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify/). Join Discord server to learn a lot more stuff.