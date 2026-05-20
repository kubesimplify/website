---
title: "Let's Simplify Golang : Part 1"
seoTitle: "Let's Simplify Golang : Part 1"
seoDescription: "Golang is one of the most desired languages to learn, and it's also one of the most popular programming languages."
datePublished: 2022-05-27T12:34:12.736Z
slug: lets-simplify-golang-part-1
author: barkatul-mujauddin
cover: /img/blog/lets-simplify-golang-part-1/fllMzV4t9.png
tags: ["code", "go", "golang", "beginner", "devops"]
cuid: cl3ofej5y055hf1nvcurz59fy
---
# Why Golang ? 

Golang is one of the most desired languages to learn, and it's also one of the most popular programming languages. It has been gaining immense popularity, and despite being just a decade old, Golang has made its mark.

The use of Golang is growing worldwide, too, especially in the cloud computing space.
A couple of major cloud infrastructure projects written in Go are Docker and Kubernetes, but there are many more.
Some famous tech companies using Golang are Google, Twitch, Uber, Medium, Adobe, Netflix, SoundCloud, Dailymotion, and many more.
With the dominance of cloud and DevOps, the future of Golang is brighter than ever.

The objective of this blog is to introduce all the basic concepts in Golang.
So, let's Simplify Golang !

# Introduction 
 
- Golang is a compiled programming language and was created by the engineers at Google.
  > The First Major version of Golang was introduced in 2012 as Golang 1.0.
- Go was created to combine -
   - The ease of programming of an interpreted, dynamically typed language 
(such as Python) 
   - with the efficiency and safety of a statically typed, compiled language. 
(such as C++)
   - It also aimed to be modern, with support for networked and multicore 
computing. 

# Key Features of Golang

- Golang’s code is neat and easy to maintain. Its Syntax is very easy to understand for beginners.
- Golang has fast compile-time and with every update and version release, it is becoming fast.
- Go has a Goroutine to enable Concurrency (Concurrency is executing more than one task simultaneously and making progress.).
- Go has its own Garbage Collector, which is used to allocate and remove the object.

# Features Excluded by Golang

- Classes not available. Class is a major functionality for OOP’s (Object oriented programming).
- No Inheritance - As classes are not there in Go, it also doesn't support Inheritance.
- Constructors are not available.
- Header files are not available.
- Array map are not available.
- No Template.
- No Exceptions.
- Use of void is not required.

# Installing Golang

To download and install quickly, you can head over to [go.dev/doc/install](https://go.dev/doc/install). 

Over here, we can see the steps to download and install Go quickly.


![gogogo.jpg](/img/blog/lets-simplify-golang-part-1/GJVHd4Xu3.jpg)

You can simply select the tab for your computer's operating system and then follow its instructions and download the package file.


![go222.jpg](/img/blog/lets-simplify-golang-part-1/QUj2r1I5I.jpg)

Now, once the file is downloaded, we will be following all the prompts by the installer.


![Untitled.png](/img/blog/lets-simplify-golang-part-1/RR-7zALO9.png)

This will make sure to install the Go distribution and will also put the installation directory in the path environment variable.
Just keep following the prompt by the installer.


![suucc.jpg](/img/blog/lets-simplify-golang-part-1/A3RrCvUL2.jpg)

Now, once you see that the installation has been completed, head over to the terminal.

To verify if Go has been installed successfully or not, type `go version`. 


![Untitled.png](/img/blog/lets-simplify-golang-part-1/hrLr1AvuQ.png)

If Go has been installed successfully, the command will print "the Golang version installed in your system".

 If Golang is not installed then an error will arise stating "Bad command or file name".

# Hello World Program

Let's practically understand this by analyzing line by line a Hello World program in Go!

```
package main

import "fmt"

func main() {
    fmt.Println("Hello, World")
}
```

>  Line 1 - package main

- Packages are Go's way of organizing and reusing code.
- Every Go program must start with the package declaration.
- Go programs are made of parts such as packages definitions and function definitions.
- In Go language, the main package is a special package, which is used with the programs that are executable and this package contains the main() function.
- Syntax of declaring a package :- 
>write the package keyword and then the name of the package.

> Line 2 - import "fmt"

- We use import keyword to include code from other packages to use with our program.
- fmt package is a short form of format, and it implements formatting
for input and output.
- So, import "fmt" basically means that we are importing the fmt package in our code because we need the functionalities provided by this package.
> Note :- package name during the import statement is surrounded by double quotes.


> Line 3 - func main()


- The main() function is a special type of function, and it is the entry point of executable programs.
- It does not take in any arguments or parameters. 
- This function executes by default when you run code in the file.

> Note :- Every executable program must contain the single main package and the main function.

- The lines of function code are enclosed in curly brackets {} ( '{'  and  '}'  denotes the starting and ending point of the function) and the code written inside the braces {} will be executed in sequence.

> Line 4 - fmt.Println("Hello World")

- The statement is made of three components :
- First, we specify the name of the package to be used, which is fmt.
- Secondly, we specify the name of the function that's present inside that package. Here, the function's name is println (which means print and then go to new line).
- The `.` Operator between fmt and println is known as the member access operator. It is used to access members of a package. In this case, we are accessing println function, which is a member of the fmt package.
- The Third part is the text Hello World enclosed within the quotes (anything within the quotes becomes a string).
- Now, we call the function println by passing it the string expression as the only argument.

> Comments 

- Comments are statements that are not executed by the compiler and interpreter.
- Go supports 2 types of comments :
  - Single Line Comment 
    ```
    // comment
    ```
  - Multi Line Comment 
     ```
     /*
     multi line
     comment
     */
     ```


# Identifiers and Keywords

## Identifiers

- Identifiers are the user-defined name of the program components. 
- In Go language, an identifier can be a variable name, function name, constant, statement labels, package name, or types.
- Identifiers starts with either a Unicode Letter or `_`.
> Identifier `_`  is a special identifier, it is called blank identifier.

Example:- 

```
// Valid identifiers:
_hello23
hello
he56llo
Hello
heLlo
hello_hello


// Invalid identifiers:
212geeks
if
default
```

## Keywords

- Keywords or Reserved words are the words in a language that are used for some internal process or represent some predefined actions.
- Keywords are not allowed to use as an identifier. Doing this will result in a compile-time error. 
- There are total 25 keywords present in the Go language as follows:

```
break     default      func    interface  select
case      defer        go      map        struct
chan      else         goto    package    switch
const     fallthrough  if      range      type
continue  for          import  return     var
```

# Data Types


A data type is a classification that specifies which type of value a variable has and what type of mathematical, relational or logical operations can be applied to it.

### Why are data types needed ?

- It categorizes a set of related values.
- It describes the operations that can be done on them. 
- It defines the way the data is stored.


 > In Go, the type is divided into four categories which are as follows:

- Basic type
- Aggregate type
- Reference type
- Interface type

## Basic Type

Basic Data Types: In Go language, Basic Data Types are categorized into three subcategories, which are:

- Numbers
- Boolean
- Strings

> Numbers

In Go language, numbers are divided into two sub-categories that are:

- Integers
- Float

here is an example of Numbers data type :

```
a := 20
b := 34.89
```

> Boolean 

- The boolean data type represents only one bit of information, either true or false.
-  The values of type boolean are not converted implicitly or explicitly to any other type.

Here is an example of Boolean data type :

```
var bVal bool   // default is false
bVal:=true     // value of bVal changed to true
```

> Strings

- String is any sequence of characters, and the characters can be numbers, letters, and symbols.
- We can initialize strings just like any other data-type.
- String concatenation can be done effortlessly.

Here is an example of String data type :

```
    var hello string = "Hello, " // initializing 
    name := "Dan"
    exclamation := "!"
     
    var result = hello + name + exclamation // concatenation
    fmt.Println(result)   // prints "Hello, Dan!"
```

> Aggregate Types

In Go language, Aggregate Types are divided into two sub-categories that are:

- Arrays
- structs

> Reference Types

In Go language, Reference Types are divided into 5 sub-categories that are:

- Pointers
- slices
- maps
- functions
- channels

> We will discuss Aggregate and Reference Types after in this blog.

# Variables

- Variable is a named unit of data that is assigned a value. It is simply a reference to a value and is one of the foundations of being able to construct programming logic.
- You can change the value of a variable.
- In Golang, declaring a variable can be achieved in a number of phases. As we know, Go is a statically typed language and as such when variables are declared, they're either explicitly or implicitly. 
- One of the ways by which you can declare a variable in Golang is using the below syntax.
```
var <variable_name>  <data_type> = <value>
```
   - A variable is initialized by using the var keyword.
   - Then we specify the variable name.
   - Then, the data type of the variable, following it is the assignment operator.
   - Then we have the value of data that we want to store.

> Here are some examples :

```
var s string = "Hello Eveyone"
var i int = 18
var b bool = false
var f float = 35.60
```

*"Hello Everyone" will be stored in the variable s, and s is a variable of string data type.*

*18 will be stored in the variable i, and i is a variable of int data type.*

## Printing Variables

To print, we'll be using the print method of the fmt package. To use it, we first need to import the fmt package. 
```
package main
import "fmt"
func main() {
        
        // Prints a string
        // Output - Hello
          
        fmt.print("Hello")

        var name string = "Emraan"

        // Prints a variable string
        // Output - Emraan

        fmt.print(name)
     
        // Prints a variable with string
        // Output - Hello Emraan

        fmt.print("Hello ",name)

        // Prints with a newline
        /* Output - Hello
                    Emraan
        */
        fmt.println("Hello")
        fmt.println(name)
  
```

## Format Specifiers


![Untitled.jpg](/img/blog/lets-simplify-golang-part-1/dRj2BCfEW.jpg)

## Declaring a Variable
 
As we have seen, In Golang we can declare a variable in many ways. We can declare the variable and assign the value to it at the same time, or we can declare the variable first and assign the value after.

> here is an example of both the ways :

```
var s1 string = "hello world"

var s2 string 
s2 = "Tata Bye Bye"
```

Variables of the same type can be declared and even assigned values on the same lines, such as this.
``` 
var a,b string = "hi", "bye
```

In the Above example, the 'a' variable will get the value "hi" and the 'b' variable will get the value "bye".

When the variables are of different data types. We can declare them like this :
```
var (
a = "hello"
i = 18 )
```

> Short Variable Declaration

`s` `:=` `Hello Everyone` 

   - It starts with a variable name. So the variable name in this case is `s`.
   - Then we have `:=` this is short variable assignment operator.
       - It indicates that the short variable declaration is being used.
       - This means that there's no need to use the var keyword or declare the variable data type.
   - Then we have the `Hello Everyone` string which will be assigned to s. 

## Variable Scope

The scope of a variable can be defined as a part of the program where a particular variable is accessible or from where it can be referenced. In Golang, scope is defined using block.
```
{
// outer block

        {

         // inner block

        }
}
```

   - Inner blocks can access variables declared within outer blocks.
   - Outer blocks cannot access variables declared within inner blocks

Now we've understood how variable scope works in terms of blocks. However, scope rules can also be determined based on where the variables are declared. 

We have two kinds of such variables, local and global variables.

> Local Variables

- Declared inside a function or a block.
- not accessible outside the function or the block.
- can also be declared inside looping and conditional statements.


![Untitled.png](/img/blog/lets-simplify-golang-part-1/T6MlzsgTj.png)

> Global Variables

- Declared outside a function or a block.
- available throughout the lifetime of a program.
- declared at the top of the program outside all functions or blocks.
- can be accessed from any part of the program.


![Untitled.jpg](/img/blog/lets-simplify-golang-part-1/54ad4GHHC.jpg)

> Zero Value

- In Golang, if you're declaring a new variable, but are not necessarily initializing it with a value, the variable is given a default value. This value is known as zero value.
- It depends on the data type of the variable.

![Untitled.jpg](/img/blog/lets-simplify-golang-part-1/iymiAciDe.jpg)

## User Input 

- One of the most used ways of taking user input is through scanner function, which is provided by the fmt package.

Syntax :
```
fmt.Scanf("%<format specifier > (s)", Object_arguments)
```

- scanner function takes the format string, along with the list of variable number of arguments.
- This string contains custom specifiers that the scanner function uses to format the final output string.
- The list here is the list of all arguments where you want to store your data.

We can take Single Inputs as well as Multiple Inputs.

> Here is an example of how we can take Single Input.

```
var name string
fmt.Scanf("%s", &name)
```
**name** variable will now contain the string entered by the user.
> Here is an example of how we can take Multiple Input.

```
var a string
var b int
fmt.Scanf("%s %d", &a, &b)
```
**a** and **b** will contain the string and integer entered by the user, respectively. 

### Find the type of variable

To check or find the type of variable or object in Golang, we can use :- 
- `%T` format specifier.
- `reflect.TypeOf` function from the reflect package.

```go
package main 
import (
         "fmt"
         "reflect")

func main() {
         var marks int = 25
         
         fmt.printf("marks is of type %T", marks)
         fmt.printf("marks variable type is %v", reflect.TypeOf(marks))
}  
```
```
OUTPUT

marks is of type int
marks variable type is int
```

> Type Casting

The process of converting one data type to another is known as Type Casting.
Data types can be converted to other data types, but this does not guarantee that the value of that variable will remain intact.

Let us learn how to do Type Casting using some examples.

> Integer to Float

```
var i int = 40
var f float64 = float64(i)

//i contains 40 and f contains 40.00
```

> Float to Integer

```
var f float64 = 23.80
var i int = int(f)

//f contains 23.80 and i contains 23
```
 

- **strconv** package - This package consists of methods that we can use to convert integer to string and vice versa.
- ** Itoa() ** method - It converts integer to string, and it just returns one value which is the string formed with the given integer.

> Integer to String

```
var i int = 75
var s string = strconv.Itoa(i)

//s contains 75 as a string
```
- ** Atoi() ** method - It converts string to integer, and it returns two values, the corresponding integer and if there's any error.

> String to Integer

```
var s string = "150"
i, err := strconv.Atoi(s)

//i contains 150 and err contains <nil>
```
> Constants

- Constants are variables whose values once initialized cannot be modified.
- The syntax to declare a constant in Golang is shown below :
```
const <const_name> < data_type> = <value>
```
- We have two kinds of constants:
  -  **typed constant**
     - constants where you explicitly specify the data type in the declaration.
     - no flexibility.
     - Example :

         ```
          const name string = "Elon"
         ```

  - **untyped constant**
     - constants are untyped unless they're explicitly given a data type and declaration.
     - They allow for much more flexibility.
     - Example : 

         ```
          const num = 18
          const my_name, my_age = "Steve", 21
         ```
-  We cannot declare a constant and not initialize it to a value and maybe try to assign it a value later on. You have to assign and declare constant at the same time. The concept of default or zero values does not apply here.
- The shorthand variable declaration does not work for constants.

- Use case of Constant : In calculating the area of a circle, we know the value of PI i.e. 3.14, it is a constant, and it is not going to change, so we can simply create a float constant for it.
` const PI float64 = 3.14 ` 

# Operators

- Operators are the foundation of any programming language.
- We can define operators as symbols that help us to perform specific mathematical and logical computations on operands.
- For example
` a + b `
*when we say a+b, the addition sign here is the **operator**, while a and b are the **operands**.*

- In Golang, we can define operators of five types:
   - Comparison Operators 
   - Arithmetic Operators 
   - Assignment Operators 
   - Bitwise Operators
   - Logical Operators

## Comparison Operators

- Comparison Operators compare two operands and give a *Boolean* value that is True or False.
- They allow values of the same data type for comparisons and return true if it matches
the comparison and false if it does not.
- We have the following Comparison Operators in Golang :
  - `==` equal
       
         var name1 string = "Alex"
         var name2 string = "Ben"
         fmt.println(name1 == name2)

        //returns FALSE
  - `!=` Not equal
       
         var name1 string = "Alex"
         var name2 string = "Ben"
         fmt.println(name1 == name2)

        //returns TRUE
  - `<` less than 

         var a, b int = 5, 10
         fmt.println(a < b)

        //returns TRUE
  - `<=` less than or equal to

         var a, b int = 12, 10
         fmt.println(a <= b)

        //returns FALSE
  - `>` greater than 

         var a, b int = 5, 10
         fmt.println(a > b)

        //returns FALSE
  - `>=` greater than or equal to

         var a, b int = 15, 15
         fmt.println(a < b)

        //returns TRUE

## Arithmetic Operators

- Arithmetic operators are frequently combined with the comparison operator to create a Boolean statement.
- These operators are used to perform common arithmetic operations, such as addition, subtraction and multiplication.
- We have the following arithmetic operators in Golang :
  - `+` addition
    > It simply adds the left and the right operand together.
    
    ```
     var i, j = 12, 15
     var a, b string = "HELLO", "WORLD"
    
     fmt.println(i + j)
    
    //returns 27 

     fmt.println(a + b)

    //returns HELLOWORLD

    /* When you use the addition operator on string it works like concatenation.*/
    ```

  - `-` subtraction
    > The subtraction operator subtracts the right operand from the left operand.

   > You can use the addition operator on string, but you cannot use the subtraction operator on string.

    ```
    var a, b int = 34, 14
    fmt.println(a - b)
  
   //returns 20
   ```

  - `*` multiplication
    > The multiplication operator multiplies both the operands.

    ```
    var a, b int = 3, 4
    fmt.println(a * b)

   //returns 12
   ```
 
  - `/` division 
    > The division operator returns the quotient, when left operand is divided by the right operand.

    ```
    var a, b int = 24, 7
    fmt.println(a / b)
  
    // returns 3 
   ```

  - `%` modulus
     > The modulus operator returns the remainder, when left operand is divided by the right operand.

     ```
    var a, b int = 24, 5
    fmt.println(a % b)
  
    // returns 4
    ```
 
  - `++` increment 
     > It is a Unary Operator. Unary operators are operators that act upon a single operand to produce a new value.

     > This operator increments the value of the operand by one.
   
     ```
      var i int = 2
      i++
      fmt.println(i)

     //returns 3
     ```

  - `--` decrement
     > It is also a Unary Operator and it decrements the value of the operand by one.

    ```
      var i int = 2
      i--
      fmt.println(i)

     //returns 1
     ```

## Logical Operators 

- Logical operators are used to determine the logic between variables or values.
- We have the following arithmetic operators in Golang :
   - `&&` logical AND
       - It returns True if **both** the statements are true.
       - It returns False when **either** of the statements is false.

      ```
      var int x = 100
      
      fmt.println((x < 150) && (x < 200))
      //returns true

      fmt.println((x < 120) && (x < 12))
      //returns false
     ```
 
   - `||` logical OR
       - It returns True if **atleast one** of the statements is true.
       - It returns Flase if **both** the statements are false.

       ```
      var int x = 100
      
      fmt.println((x < 50) || (x < 200))
      //returns true

      fmt.println((x < 20) || (x < 12))
      //returns false
     ```

   - `!` logical NOT
      - It is a Unary Operator (works only on one operand or on one expression).
      - This operator basically reverses the result.
      
      ``` 
       var int x = 50
       
       fmt.println( !(x<20) )

       //returns true
       ```

## Assignment Operators

- We have the following arithmetic operators in Golang :
  - `=` assign
    > The assign operator assigns left operand with the value to the right.

    ``` 
     var a int = 10
     var b int 
     b = a
   
     // a get assigned the value 10
     // b get assigned the value of a that is 10
     ```

  - `+=` add and assign
    > Add and assign operator assigns the left operand with the addition result.

    > `a+= b` means `a = a + b`

    ```
     var a, b int = 20, 10
     a+ = b
 
    // a assigned to a value 30
    ```

  - `-=` subtract and assign
    > The subtract and assign operator assigns left operand with the subtraction result.

    > `a-= b` means `a = a - b`

    ```
     var a, b int = 20, 10
     a- = b
 
    // a assigned to a value 10
    ```

  - `*=` multiply and assign
     > The multiply and assign operator assigns left operand with the multiplication result.

     > `a*= b` means `a = a * b`

     ```
     var a, b int = 20, 10
     a* = b
 
    // a assigned to a value 200
    ```   

  - `/=` divide and assign quotient
     > This operator assigns left operand with the quotient of the division.

     > `a/= b` means `a = a / b`

     ```
     var a, b int = 20, 10
     a/ = b
 
    // a assigned to a value 2
    ```   
  - `%=` divide and assign modulus
     > This operator assigns left operand with the remainder of the division.

     > `a%= b` means `a = a % b`

     ```
     var a, b int = 20, 10
     a% = b
 
    // a assigned to a value 0
    ```   

## Bitwise Operators

- Bitwise operators work at bit level or perform bit by bit operation.
- We have the following bitwise operators in Golang:
   - `&` bitwise AND

   This operator takes two numbers as operands and does AND operation on every bit of two numbers. 
       
![.,,.,.,.;;;'.png](/img/blog/lets-simplify-golang-part-1/yl-JW4lk6.png align="left")
     
       var x, y int = 12, 25
       z := x & y
       fmt.Println(z)

      //returns 8
       
   - `|` bitwise OR
 
   Bitwise OR takes two numbers as operand and does OR on every bit of two numbers.
      
![or.jpg](/img/blog/lets-simplify-golang-part-1/46KRSYR3P.jpg align="left")
  
```
   var x, y int = 12, 25
   z := x | y
   fmt.Println(z)

  //returns 29
```  

   - `^` bitwise XOR
     - It takes two numbers as operand and does XOR on every bit of two numbers.
     - The result of XOR is 1 if the two bits are *opposite* and 0 when both of the bits are *same*.
    
![klkl.jpg](/img/blog/lets-simplify-golang-part-1/eVUoD0bJL.jpg align="left")
  
```
   var x, y int = 12, 25
   z := x ^ y
   fmt.Println(z)

  //returns 21
```

   - `<<` left shift
      -  It shifts all bits towards the left by a certain number of specified bits.
      - The bit positions that have been vacated by the left shift operator are filled with 0.
      
![okol.jpg](/img/blog/lets-simplify-golang-part-1/5l4wT7jCc.jpg align="left")

       
       var x int = 212
       z := x << 1
       fmt.Println(z)

       //returns 424
      

   - `>>` right shift
     - It shifts all bits towards the right by a certain number of specified bits.
     - excess bits shifted off to the right are discarded.
     
![pkpk.jpg](/img/blog/lets-simplify-golang-part-1/T7nl8Z8cs.jpg align="left")

    
     var x int = 212
     z := x >> 2
     fmt.Println(z)

    //returns 53

# Control Flow

The control flow basically means that when you read a script, you must not only read
from start to finish, but also look at the program structure and how it affects the order of execution.

In the below example,  we want to write a program that validates if the user is eligible to vote or not. We are taking the age as input and check if the age is greater than or is equal to 18. We print 'eligible' if it is. If not, we print 'not eligible'.
So, Over here we had a control flow, and it was controlled by the control structure which determined the rest of the flow of the program.


![kuku.jpg](/img/blog/lets-simplify-golang-part-1/c6yt_krWz.jpg align="left")

## if 

Below is the syntax for if statement :
```
if condition {
   // executes when condition is true
}
```
The *if* statement is provided with a condition. The *if* statement evaluates this condition, and if this condition is true, statements inside the body of *if* are executed. If the condition is false, the statements inside the body of *if* are not executed.
> Note, the parentheses around the condition
are optional.

Example :

```
var a, b string = "happy", "world"

if a == b {
   fmt.println("equal")
}

//fmt.println function will not execute.
```
## if-else

The *if* statement may also have an optional else block that runs when the *if* condition is not met. If the condition is evaluated to true, the statements inside the *if* body are executed while if the condition is false, the statements inside the else body are executed.
> Note, for the syntax in *if-else* block, the else statement should start from the same line where the *if* ends Else, it will throw us an error.

Example :

```
var a, b string = "happy", "world"

if a == b {
   fmt.println("equal")
} else {
   fmt.println("not equal")
```

## else-if statement

We also have the *else-if* statement to specify a new condition if the first condition is false  

> We can specify multiple else-if condition, and the else block is optional to add.

```
if condition_1 {
// execute when condition_1 is true
} else if condition_2 {
/* execute when condition_1 is false,
and condition_2 is true */
} else if condition_3 {
/* execute when condition_1 and 2 are false,
and condition_3 is true */
} else {
// when none of the above conditions are true
}
```

## Switch Case

We learned how if/else statements help us in specifying conditions and taking actions accordingly. Switch statement is a similar control structure. However, in switch-case control mechanism, we use the value of a variable or an expression to change the control flow of program execution via a multi-way branch. Using if or switch-case,
depends on the programmer and the use case.

Syntax of the switch case :
```
switch expression {
case value_1:
// execute when expression equals to value_1
case value_2:
// execute when expression equals to value_2
default:
// execute when no match is found
}
```
The switch statement tests the value of an expression and compares it with multiple cases. Once the case match is found, a block of statements associated with that particular case is executed. Each case in a block of a switch has a different name, or a number, or a value, which is referred to as an identifier. The value that's provided in the expression is compared with all the cases inside the switch block until the match is found.

> In case no match is found, the default statement is executed, and the control goes out of the switch block.

Example :
```
var i int = 100
>>> go run main.go
i is either 100 or 200
switch i {
}
case 10:
fmt.Println("i is 10")
case 100, 200:
fmt.Println("i is either 100 or 200")
default:
fmt.Println("i is neither 0, 100 or 200")
}
```
> fall-through


The *fall-through* keyword is used in switch-case, to force the execution flow to fall through the successive case block.

How *fall-through* keyword works?

It keeps on falling through the successive case block until we find the default keyword
and the entire switch-case ends or until it finds a case, which does not consist of the *fall-through* keyword.
```
var i int = 10
switch i {
    case -5: 
        fmt.Println("-5")
    case 10:
        fmt.Println("10")
        fallthrough
     case 20:
        fmt.Println("20")
        fallthrough
     default :
        fmt.println("default")
}
```

### Switch with conditions

Instead of using a single value, we can even use conditional statements for switch.
In below case, we do not need to mention an expression after switch. We can simply write our conditions inside the case blocks itself.
```
switch {
   case condition_1:
      // execute when condition_1 is true
   case condition_2:
      // execute when condition_2 is true
   default:
      // execute when no condition is true
  }
```
Example :
```
var a, b int = 10, 20
switch {
    case a+b == 30:
        fmt.Println("equal to 30")
    case a+b <= 30:
        fmt.Println("less than or equal to 30")
    default:
        fmt.Println("greater than 30")
}
```
> Go uses an implicit break statement for each case.

## Loop 

A loop is a sequence of instructions that is continually repeated until a certain condition is reached.

Below is the syntax for for loop :
```
for initialization; condition; post {
       // statements
}
```
- First, we have the for keyword. 
- Then we have the initialization statement. It is optional, and it executes before the for loop starts. It is mostly used in simple statements
like variable declarations or increment or assignment statement.
- Then we have the condition statement. It holds a Boolean expression, which is evaluated at the starting of each iteration of the loop. If the value of the conditional statement is true, then the loop will execute.
- Then we have the post statement, which is also optional and is executed after each iteration of the for loop. After the post statement,
the condition statement evaluates again. If the value of the conditional statement is false, then the loop ends.

Example :

```
for i := 1; i <= 3; i++ {
    fmt.Println("Hello World")
}


OUTPUT :

Hello World
Hello World
Hello World
``` 
> Infinite loop

An infinite loop is a looping construct that does not terminate the loop and executes the loop forever.

Example : 
```
sum := 0
for {
    sum++   // repeated forever
}
    fmt.Println(sum)   // never reached
```

> break 

The break statement ends the loop immediately when it is encountered.
 
```
for i := 1; i <= 5; i++ {
     if i == 3 {
        break
      }
     fmt.Println(i)
}


OUTPUT :

1
2
```
> continue

The continue statement skips the current iteration of the loop and continues with the next iteration.

```
for i := 1; i <= 5; i++ {
     if i == 3 {
       continue
      }
     fmt.Println(i)
}


OUTPUT :

1
2
4
5
```

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.
    


       
 

  




