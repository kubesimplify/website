---
title: "Let's Simplify Golang : Part 3"
seoTitle: "Let's Simplify Golang : Part 3"
datePublished: 2022-08-05T09:32:50.207Z
slug: lets-simplify-golang-part-3
author: barkatul-mujauddin
cover: /img/blog/lets-simplify-golang-part-3/sZQL50Uzx.jpg
tags: ["go", "devops", "programming-languages", "kubesimplify"]
cuid: cl6g9qwjb00t8xvnva93z8xho
---
This blog is part of the **Golang** series. 
[Part1](https://kubesimplify.com/lets-simplify-golang-part-1)
[Part2](https://kubesimplify.com/lets-simplify-golang-part-2). Check them out if you haven't already. 

# Functions

- A Function is a mapping between zero or more parameters for the input and zero or more parameters for the output.
- Functions are self-contained units of code that carry out a certain job.
- They help us divide a program into small manageable, repeatable, and organizable chunks of code rather than a big pile of code.
- Functions in Go can be assigned to variables, passed as an argument and can be returned from another function.

![fncfnc.jpg](/img/blog/lets-simplify-golang-part-3/zq89JxK7h.jpg align="left")

For example, we have the **len** function to calculate the length of a slice. Here, the input for this length function is a slice. The function then does some processing to calculate the length and then returns to us the number of elements present in that slice.

---

## Why use Functions?

- **Reusability**: You define a function once and then can call it multiple times in your code.
- **Abstraction**-Functions can be used to extract the inner implementations.

---

## Functions Syntax

In Golang, functions inform the compiler and the programmer about the types of input and output that the function will accept.

Syntax:
```.go
func <function_name>(<parameters>) <return type>  {
// body of the function
}
```

- In Go, a function declaration starts with the **func** keyword, which is followed by the **name of the function**.
- The function name is further followed by a *pair of parentheses*. This set of parentheses includes our input variables for this function. The input variables are also known as input parameters. 
- We might then have a return value.
- The opening brace signifies the start of the function body, which is terminated by the closing bracket, and we have the function body within them.
- The very first line of the function is known as the "Function Signature". It includes the function name, its arguments, and the return type.
- So, we can say a function has two parts: the "function signature" and the "function body".

Example :
```.go
func addNumbers(a int, b int) int  {
// body of the function
}
```

A good example of this would be a simple function to add two numbers. We have our func keyword, the name of the function as addNumbers in this case, and then we have our input variables. This function takes two numbers as inputs. Then we have a return value, which is of type int, following which we have our curly braces, and they contain the body of the function.

The above function can be visualized with the diagram below.

![inputout.jpg](/img/blog/lets-simplify-golang-part-3/MyxkWeTOP.jpg align="left")

We have **a** and **b** as a set of inputs, and we have a **sum** as an output. The sum would be of an integer data type.

---

## Return Keyword

- The **return** keyword is used to return from a function when its execution is complete.
- When a return statement is reached in a function, the program returns to the code that invoked or called that function.
- A function can return a value or not even return anything.
- If we have a function with return type int, it means that in our function body we would have a statement that returns an int. See the example below.

```.go
func addNumbers(a int, b int) int  {
sum := a + b
        return sum
}
```
We have first calculated the sum of `a` and `b` and then have written the `return sum`. Since a and b both are integers, the sum variable would be an integer itself. Hence, when we say return sum, we have also specified in a function declaration that we are returning an integer datatype.

---

## Calling a Function

We now know how to define functions, but how do we call them or invoke them when we need them?

Syntax:
```.go
<function_name>(<argument(s)>)
```

First, we write the name of the function, add parenthesis after the function's name, and inside the parenthesis, we add any arguments or inputs that the function requires
separated by commas.

For addNumbers function, you could specify the name of the function and then two integers as input. Example - ` addNumbers(2, 3) `

To receive the values returned by a function, we can store them in variables.
```.go
sumOfNumbers := addNumbers(2, 3)
```
Above, we have stored the sum that is returned by our addNumbers function in our variable *sumOfNumbers*.

---

## Naming Convention for Functions

- A function name must begin with a letter.
- It cannot start with a number.
- It can have any number of additional letters and symbols.
- It cannot contain spaces.
- It is case-sensitive. (function, Function, and FUNCTION are three different functions) 
- Each word after the first in a function name that has two or more words should be capitalised. More specifically, in a compound word, we must use camelCase conventions. (e.g. nameOfTheFunction)

> Few Invalid Function Names Examples

- 3sum
- sum numbers

> Few Valid Function Names Examples

- sum3
- sumNumbers

---

## Parameters vs Arguments

- The **parameters** are the variables that we can define in the function declaration.
- The **arguments** are the variables that we can define in the function call statement for execution. 

| Arguments         | Parameters |
|:--------------:|:-----:|
| In function call statements, we used the arguments to pass values from the calling function to the receiving function. | We used the local variables in the function declaration to obtain the value from the arguments. |        
|  They are also known as Actual Parameters.  |  They are also known as Formal Parameters. |        

![PAPAPAPA.jpg](/img/blog/lets-simplify-golang-part-3/1unq5O3_P.jpg align="left")

- We have two kinds of parameters
   - **Input parameters** - They pass values into functions. 
   - **Output parameters** - They return values from a function.

Example:

```.go
package main
import "fmt"

func printGreeting(str string) {
        fmt.Println("Hey there,", str)
}

func main() {
         printGreeting("KubeSimplify")
}

Output:

Hey there, KubeSimplify
```

---

## Return Types

### Returning Single Value

We already know how to use functions to return a single value.
```.go
func add Numbers(a int, b int) int  {
sum := a + b
        return sum
}
```

> Note:- The return value must match the function signature. If not, we get a **type mismatch error**.

---

### Returning Multiple Values

In Go, a function can return multiple values. When we want to return a value from a function, we need to add the otherwise optional return type in the function declaration. Go makes it possible to return multiple values from a single return statement. 

```.go
package main
import "fmt"

func operation(a int, b int) (int, int) {
  sum := a + b
  diff := a - b
  return sum, diff
}

func main() { 
  sum, difference := operation(20, 10)
  fmt.Println(sum, difference)
}

Output:

30  10 
```

- In the above example, we have a function called operation. It takes two input parameters, both of them being integers.
- The function operation returns the sum and the difference between the two input integers. 
- The return types are mentioned in the declaration. 
- The statement containing the return values is also known as the terminating statement, as the function will terminate and return to where it was called from the moment this statement is encountered.
- Both return values are stored in the main function.

---

## Named Return Values

```.go
package main
import "fmt"

func operation(a int, b int) (sum int, diff int) {
  sum = a + b
  diff = a - b
  return 
}

func main() { 
  sum, difference := operation(20, 10)
  fmt.Println(sum, difference)
}

Output:

30  10 
```

- Golang allows giving the names to the return or result parameters of the functions in the function signature or definition.
- Note how we did not use the shorthand operator in the above example to declare and initialize these variables because they've been already declared in the function signature.
- As a result, the need to provide the variable names in the return statement is basically eliminated.
- The only way to return the result to the caller when using named return parameters is to use the return keyword at the end of the function.
- In the above example, we did not need to mention any variable name after the return statement because, in a function declaration, we've already given the name of the parameters that we want to return.
- This concept is generally used when a function has to return multiple values.
- For the user's comfort, and to enhance the code readability, Golang provides this facility.

---

## Variadic Functions

- Variadic functions are functions that accept variable number of arguments.
- In Go, it is possible to pass a varying number of arguments of the same data type as referenced in the function signature.
- To declare a variadic function, the type of the final parameter should be preceded by an ellipsis,". . ."
- we will be discussing it in the example in more detail.

> For the declaration of the variadic function, the type of the last parameter is preceded by an ellipsis, that is three dots. It indicates that the function can be called at any number of parameters of this type. There can be any number of parameters in a function, but if you want to use variadic parameters, you'll have to place them at the end.

Syntax :
```.go
func <func_name>(param-1 type, param-2 type, para-3 ...type) <return_type>
```

Example:
```.go
func sumNumbers(numbers ...int) int
```
In the above example, the function signature accepts an arbitrary number of arguments of the type int. The function will accept zero or more integers, and within the function, the numbers variable will contain a slice of all the arguments.

In simple terms, we can say that all the integer arguments passed will be stored in a slice called numbers.

```.go
func sumNumbers(str string, numbers ...int) 
```

In the above example, we have two parameters: a string and multiple integers. The variadic parameter is placed towards the end.

Example :
```.go
package main
import "fmt"

func sumNumbers(numbers ...int) int {
      sum := 0
      for _, value := range numbers {
            sum += value
      }      
     return sum
}

func main() {

        fmt.Println(sumNumbers())
        fmt.Println(sumNumbers(10))
        fmt.Println(sumNumbers(10, 20))
        fmt.Println(sumNumbers(10, 20, 30, 40, 50))
}

Output:

0
10
30
150
```

---

## Blank Identifier `_`

- The blank identifier is the single underscore operator.
- It is used to ignore the values that are returned by functions.

> We have already used `_` using the range function for looping.

Example:
```.go
package main
import "fmt"

func f() (int, int) {
        return 42, 53
}

func main() {
        v , _ := f()
        fmt.Println(v)
}

Output:

42
```

---

## Recursive Functions 

- Recursion is a concept where a function calls itself by direct or indirect means.
- The function keeps calling itself until it reaches a base case.
- It is generally used to solve a problem where the solution is dependent on the smaller instance of the same problem.

Example: factorial(5) = `5 * 4 * 3 * 2 * 1`
```.go
package main
import "fmt"

func factorial(n int) int {

        // Base Case
        if n == 0 {
             return 1
        }
       return n * factorial(n-1)
}

func main() {
         n := 5
         result := factorial(n)
         fmt.Println("Factorial of", n, "is :", result)
}

Output:

Factorial of 5 is : 120
```

Let's see how recursion is going to work for calculating the factorial of five.

![factorial.jpg](/img/blog/lets-simplify-golang-part-3/Kle8chRUo.jpg align="left")

---

## Anonymous Functions

- An anonymous function is a function that is declared without any named identifier to refer to it.
- They can accept inputs and return outputs, just as standard functions do.
- They can be used for containing functionality that need not be named and possibly for short-term use.

Example:
```.go
package main
import "fmt"

func main() {

        x := func(l int, b int) int {
            return l * b
        }
        fmt.Printf("%T \n", x)
        fmt.Println(x(20, 30))
}

Output:
 
func(int, int) int 
600
```

Example:
```.go
package main
import "fmt"

func main() {
        x := func(l int, b int) int {
        return l * b
        }(20, 30)
        fmt.Printf("%T \n", x)
        fmt.Println(x)
}

Output:

int
600
```

---

## Defer Statement

- A defer statement delays the execution of a function until the surrounding function returns.
- The deferred call's arguments are evaluated immediately, but the function call is not executed until the surrounding function returns.

Example:
```.go
package main
import "fmt"

func printName(str string) {
        fmt.Println(str)
}
func printRollNo(rno int) {
        fmt.Println(rno)
}
func printAddress(adr string) {
        fmt.Println(adr)
}

func main() {
        printName("Joe")
        defer printRollNo(23)
        printAddress("street-32")
}

Output:

Joe
street-32
23
```

In the above example, we have created a function called printName, and it simply prints the input string, then we have a function called printRollNo and printAddress.

Now, in our main function, we first call the printName function, then the printRollNo function, and then printAddress function. Before calling our printRollNo function, we've mentioned the defer keyword. *The defer statement will delay the execution of the printRollNo function now until the surrounding function returns.

When we run our program, we get this output.
```
Joe
street-32
23
```

What happens there is, first, the control goes to the printName method, and we're passing the string, Joe, it calls the printName function, and we get Joe in the output.
The next line in the control is defer printRollNo. Now, we are going to wait until the surrounding function returns. The surrounding function is the printAddress function.
In this case, the printAddress is called, and we get street-32 in the output. Now, since the surrounding function has returned, it's time to call a printRollNo function. This call will be executed and we will get 23 in the output.

---

# Pointers

- When we talk about memory management in programming, we generally deal with RAM, random access memory.
- Whenever a variable is declared a certain amount of memory in the RAM is allocated for it and it is based on the data type of the variable being used in the program.
- This memory allocation is done while the program is running and hence the variables
might get a different address every time a program is run.
- A pointer is a variable that holds the memory address of another variable.

For example, we have a variable x and we have a pointer that stores the address of variable x.

![pointtt.jpg](/img/blog/lets-simplify-golang-part-3/oZk15UdMK.jpg align="left")

As we can see that x was stored in the memory address 0x0301. When you declare a pointer ptr it also stores the memory address of x which is 0x0301.

> Why are pointers considered special variables? 

Because they do not only hold memory addresses but they also point out where this memory is located and provide ways to find or even change the value that's located at that memory location.

---

## Address and Dereference Operator

Let's discuss the two most common pointer operators: the **address**
and the **dereference** operator. 

- ** & operator ** - The address of a variable can be obtained by preceding the name of a variable with an ampersand sign (&), known as **the address-of operator**.
- ** * operator ** - It is known as **the dereference operator**. When placed before an address, it returns the value at that address. It is denoted by the asterisk sign (*).

Let us understand these operators with an example.

![popopo.jpg](/img/blog/lets-simplify-golang-part-3/P6HQt8yoL.jpg align="left")

First, we have a variable x that's assigned the value 77. Now, of course, this variable is going to take up some memory, and hence, it also has a memory address. 

If we write `&x`, it would give us the address of x. That is 0x0301 in the above example.`&x = 0x0301`

And if we write asterisk and then the address, so we are trying to dereference the address over here, it would give us the value at that address, which is the value of x, 77.`*0x0301 = 77`

Example:
```.go
package main
import "fmt"

func main() {
         i := 10
         fmt.Printf("%T %v \n", &i, &i)
         fmt.Printf("%T %v \n", *(&i), *(&i))
}

Output:

*int 0xc00018c008 
int 10
```

## Declaring a Pointer

We can declare a pointer using the syntax below.

```.go
var <pointer_name> *<data_type>
```
- First, we have the **var** keyword, the **name of the pointer**, and an **asterisk**. This asterisk is used for declaring a pointer. *(Do not confuse it with the dereference operator)*. Then we have the **data type of the pointer**. This is the data type of the variable, whose address we want to store. 

Example: 
```.go
var ptr_i *int

var ptr_s *string
```

Example:
```.go
package main
import "fmt"

func main() {
         var i *int
         var s *string
         fmt.Println(i)
         fmt.Println(s)
}

Output:

<nil>
<nil>
```
> Zero value of a pointer is nil.

---

## Initializing a Pointer

We can initialize a pointer using the syntax below.

```.go
var <pointer_name> *<data_type> = &<variable_name>
```

First, we have the var keyword, the name of the pointer, asterisk, the data type of the variable, whose address we need to store, the assignment operator, ampersand sign, and the variable name. Ampersand and the variable name, basically, give us the address of that particular variable. Hence, we are storing that address in a pointer.

Example:
```.go
i := 10
var ptr_i *int = &i
```

We've created variable **i**, and then we have created a pointer to store the address of this variable.

We have one more method of initializing a pointer, which is shown in below.
```.go
var <pointer_name> = &<variable_name>
```

In this case, we have the var keyword and we have the pointer name, but we will not use the asterisk sign and the data type. In this case, the data type will be internally determined by the compiler, as we are initializing the variable with the address of another variable. 

Example: 
```.go
s := "hello"
var ptr_s = &s
```

The next method is to use the shorthand operator. In this case, we skip the var keyword as well, but we have to use the shorthand declaration operator and it will store the address of the variable. 

Example:
```.go
s := "hello"
var ptr_s = &s
```

Example:
```
package main
import "fmt"

func main() {
        s := "hello"
        var b *string = &s
        fmt.Println(b)
        var a = &s
        fmt.Println(a)
        c := &s
        fmt.Println(c)
}

Output:

0xc000010230
0xc000010230
0xc000010230
```

---

## Passing by Value in Functions

- There are two ways of passing arguments to a function: **Passing by value** and **passing by reference**.
- Passing by value in functions means that the function is called by directly passing the value of the variable as an argument.
- The parameter is copied into another location of your memory.
- When accessing or modifying the variable within a function, only the copy is accessed or modified, and hence the original value is never modified.
- Passing by value is usually how we pass values to functions.

> **All basic data types** like integer, float, boolean, and string are **passed by value**.

Let us understand passing by value with an example.

```.go
func modify(a int) {
         a += 100
}

func main() {
         a := 10
         fmt.Println(a)
         modify(a)
         fmt.Println(a)
}
```

First, we have created a variable called **a** inside our main function. It takes up some memory and has a memory address. We then have a function called *modify*. When we call modify by passing **a** as an argument, the value of A is copied at some other place in the memory, and any change in the parameter inside the function would not affect the original value of A, that is 10. 

![exampl.jpg](/img/blog/lets-simplify-golang-part-3/IvjarG4_n.jpg align="left")

Example:
```.go
package main
import "fmt"

func modify(s string) {
        s = "world"
}

func main() {
         a := "hello"
         fmt.Println(a)
         modify(a)
         fmt.Println(a)
}

Output:

hello
hello
```

---

## Passing by Reference in Functions

- Go supports pointers, allowing you to pass references to values within your program.
- In a call by reference or pointer, the address of the variable is passed into the function call as the actual parameter.
- All the operations in the function are performed on the value stored at the address
of the actual parameters and hence, the modified value gets stored at the same address.

> **Slices** and **Maps** are **passed by reference** by default.

Let us understand passing by reference with an example.


```.go
func modify(s *string) {
       *s = "world"
}

func main() {
        a := "hello"
        fmt.Println(a)
        modify(&a)
        fmt.Println(a)
}
```

- We have created a variable **a**, inside our main function. It takes up some memory and has a memory address. 
- Then we call modify, we are passing the address of **a** variable in this case. 
- We are storing this address in our *input parameter* **s**, which is a pointer in the modify function. 
- This makes s store the address of an original variable a or in simple terms, the pointer s is now pointing to the same location. 
- Any change in the parameter inside the function, would also affect the original value of a, and hence, a value changes from hello to world. 
- This happens because ampersand a and s, are basically two different pointers that are pointing to the same location. 
- This is how we can use pointers to *pass a variable by reference*, so *any change inside the function will also affect the original variable*.

Example:
```.go
package main
import "fmt"

func modify(s *string) {
         *s = "world"
}

func main() {
        a := "hello"
        fmt.Println(a)
        modify(&a)
        fmt.Println(a)
}

Output:

hello
world
```

---

If you have reached it so far, thanks for a reading mate 🤝 


Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.












 










 