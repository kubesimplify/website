---
title: "A Simplified Guide To YAML"
seoDescription: "One of the main reasons why YAML popularity has increased so much over the past few years is that it is super human-readable and intuitive which makes it a"
datePublished: 2022-04-10T21:02:07.000Z
slug: a-simplified-guide-to-yaml
author: barkatul-mujauddin
cover: /img/blog/a-simplified-guide-to-yaml/NiqH4PapA.jpg
tags: ["cloud", "tools", "kubernetes", "yaml", "technical-writing-1"]
cuid: cl1uret2o017qkmnvd3gl03gc
---
*YAML is quite popular in the DevOps tools. One of the main reasons why YAML popularity has increased so much over the past few years is that it is super human-readable and intuitive which makes it a great tool for writing configuration files for DevOps tools like Docker, Kubernetes, Ansible, Prometheus, etc.*

*In this post, we will learn just enough syntax of YAML so that when anyone saw any configuration files from now on, he/she can easily understand what it means.*

## What is YAML?

- YAML is a simple human readable language that can be used to represent data and works well with other programming languages. YAML is neither a programming language nor a markup language. YAML is a **Data Serialization** language.

- It was previously known as "Yet Another Markup Language"  but now its called **"YAML Ain't Markup Language"**. Markup languages are used to store only *documents*. But YAML can store **objects data** along with **documents**. 
The two most popular markup languages are HTML and XML.
> YAML is superset of JSON : Any valid JSON file is also a valid YAML file.


As we try to learn YAML, we came across its competitors in this field which is XML and JSON. We’ll show you examples of the three so that you can understand why YAML so popular among these three.

> **XML**

```
<Servers>
    <Server>
        <name>Server1</name>
        <owner>Tony</owner>
        <created>12232012</created>
        <status>active</status>
    </Server>
</Servers>
```

> **JSON**

```
{
       Servers: [
               {
               name: Server1,
               owner: Tony,
               created: 12232012
               status: active
               }
        ]
}
```

> **YAML**

```
Servers: 
        -     name: Server1
               owner: Tony
               created: 12232012
               status: active
```

So as YAML uses line separation and spaces with indentation instead of tags with angle brackets in XML and curly bracket in JSON. It’s a lot more easy to understand by others than XML or JSON.

That is why DevOps tools like (Docker, Kubernetes, Ansible, Prometheus, etc.) use YAML for writing configuration files.  

## What is Data Serialization?

- **Data Serialization** is a process of converting the data objects that is present in some complex data structure into a stream of bytes that can be used to store, transfer and distribute on physical devices. 

     ![blog.jpg](/img/blog/a-simplified-guide-to-yaml/Y5S-1Af4B.jpg)
- The reverse process of data serialization is called *data deserialization*.
- YAML, JSON, XML are data serialization language.

> YAML has become a pretty widely used format for writing configuration files for many different DevOps tools and applications.  


## Uses of YAML
- Importing and exporting data to and from the server.
- Configuring files can be written in YAML. 
- Transferring data between two different components of the application.
- Intermediate data storing.

## Benefits of YAML
- YAML is simple and easy to read.
- Easily convertible to JSON and XML files.
- Most programming languages use YAML for data serialization.
- You can only store data and not commands in YAML.
- YAML is more powerful when representing complex data.
- Parsing is Easy in YAML(parsing means reading the data).

## DataTypes in YAML
- In YAML, there are three types of primitive datatypes
   - Scalars
   - List 
   - Mappings (Key-Value pairs)

> **Scalars**

- Scalars are data which can be identified as a single value.
- The value of the scalar can be integer, float, Boolean, etc.
- Here is an example of Scalars data types :

```
 str1: this is a normal string

chocolates: 39

price: 12.25

flag: no

```

> **Lists**

- In YAML, a list or collection of values can be represented in two ways :
   - block style
   - flow style

- Here is an example of block style :

```
   ---   
   lists:
     - first
     - second
     - third

   ```

- Here is an example of flow style :

```
---  
lists: [ first, second, third ]
```
- Here is an example of nested list :

```
---
students:
    - 
        name: Mark
        roll: 03
        subjects:
            - computer organizations
            - operating system
            - digital electronics
   -    
        name: Harry
        roll: 14
        subjects:
            - object oriented programming
            - data structures
            - system design

```


> **Mappings**

- Mappings (or hashes, dictionaries) are unordered sequences of key/value pairs.
- Keys in a dictionary must be **unique**.
  > everything inside YAML is a member of a dictionary.
- Here is an example:

```
character:
  name: rahul
  subject: maths
```

In the example above, the *name* and *subject* keys are members of the same dictionary, respectively mapped to the “rahul” and “maths” values.

- Above example can be also represented in the following way:

```
character: { name: rahul, subject: maths}
```
- Here is an Example of Primitive Data types in Yaml :

```
---
first_name: Sam
last_name: Hales
occupation: Doctor
---
married: true
spouse: 
        name: Alexa
        occupation: Freelancer
        interests: 
              - Blog
              - Music
---
dog_count: 2
dog_names: [ Brody, Tommy ]
...
```

## Some Important Points of YAML
- YAML is **case sensitive**.
- In YAML, we use **spaces** for Identation and not tabs.
- File extensions must be **.yaml** or **.yml**.
- There are no multi-line comments in YAML.
   (Only **single-line** comments are available).
   - below is an example of single line comment 
```
# An Employee record
```
- The **---** symbol mark represents the **start** of a document.
- The **...** symbol mark represents the **end** of a document.

> Below is an example of how YAML can be used in creating docker-compose.yaml file.

```
version: "3"

services:
 my-service:
   build: ./dockerProject
   volumes:
     - ./dockerProject:/usr/src/app
   ports:
     - 5001:80

 website:
   image: php:apache
   volumes:
     - ./website:/var/www/html
   ports:
     - 5000:80
   depends_on:
     - my-service
```


This is my first blog. Thanks for reading. 

If you find the blog useful don't forget to like, share and comment.

Connect with me on [Twitter](https://twitter.com/barkatul_20) and Follow [kubesimplify](https://twitter.com/kubesimplify).

 



 


