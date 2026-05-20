---
title: "Let's Simplify Golang : Part 2"
seoTitle: "Let's Simplify Golang : Part 2"
datePublished: 2022-06-20T12:56:03.223Z
slug: lets-simplify-golang-part-2
author: barkatul-mujauddin
cover: /img/blog/lets-simplify-golang-part-2/fd3Zc2gyl.png
tags: ["go", "devops", "programming-languages", "devops-articles"]
cuid: cl4mqr2h2000nwfnv83ki0zly
---
This blog is the second part of the **Let's Simplify Golang** Series. 

In the first part ([Let's Simplify Golang: Part 1](https://kubesimplify.com/lets-simplify-golang-part-1)), we learned about all the basic concepts in Golang. In this blog, we would be learning about Arrays, Slices and Maps.

So, let's start with Arrays now.


---

# Array

- An Array is a collection of **similar data elements**.

For Example - we can have a collection of Integers that represents roll numbers
of students in a class, or a collection of strings that might represent characters of a show.


![arrss.jpg](/img/blog/lets-simplify-golang-part-2/HGlMAt-ZN.jpg align="left")

- Elements in arrays are stored at **contiguous memory locations**.

For example, we can have an array of five elements, and let's say the memory allocation here starts from the memory address 200.
Now, as you might have noticed that the next memory address is 204 because an integer takes **four bytes**, and hence the next address could be stored after four bytes. So, You might notice that all the integers over here are stored one after the other.


![a222.jpg](/img/blog/lets-simplify-golang-part-2/2_fdog5xh.jpg align="left")

In addition to this, arrays are also known as homogenous data types, since we can store elements of a single data type in one array and not different data types in one single array.

---

## Why do we need arrays?

In programming, most of the time, we need to store a large amount of data of a similar type.

For example, let's say we want to store marks secured by a student in three subjects. So, Instead of creating three different individual variables to store these values, we can simply create an array called *grades*, and we can store these marks together.

![a212121.jpg](/img/blog/lets-simplify-golang-part-2/WYLEQdvhv.jpg align="left")


![a232323.jpg](/img/blog/lets-simplify-golang-part-2/Pw89WMbGU.jpg align="left")

- Arrays in Golang are of fixed length i.e, once they are declared and the size is mentioned, we cannot change the length 
- The elements in the array should be of the same data type.
- An array, in Golang, has a pointer that points to the first element in the array and since memory is contiguous, we can even calculate the address of any element that we want to.
- It also has a property called *length,* which denotes the number of elements in the array, and a property called capacity, which denotes the number of elements that it can contain.
> In the case of arrays, length and capacity are the same. However, we will learn more about capacity while studying slices.


![poin.jpg](/img/blog/lets-simplify-golang-part-2/pjG_XnUWe.jpg align="left")

---

## Array Declaration 

Let us see how we can declare arrays in Golang.

`var` `<array_name>` `[size_of_the_array]` `<data_type>` 

We have a **var** keyword, the *name of the array*, the **size** of the array, and the **data type**.

So, let's declare an array of four integers now.

`var` `marks` `[4]` `int`

Over here, we have a **var** keyword, the name of the array is *marks*, we want it to be of length *four*, and we want it to be of *integer* data type. 

Let's create one more array.

`var` `cities` `[5]` `string`

Over here, we've created an array of three strings, and we've named it cities.

> If we didn't initialize the array and try to use the println method to print the array, we will get an array that consists of only zeros if it is of type integer. This is because we haven't initialized the array yet and since the array is of integer data type, we get zero because zero is the zero value of integers. And if the array is of strings, we get an array of empty strings.

Example : 

```
package main
import "fmt"

func main() {

         var grades [4] int
         fmt.Println(marks)

         var fruits [3] string
         fmt.Println(cities)
}

Output :

[0 0 0 0 ]
[ ]

```
---

## Array Initialization 

Let's see how we can initialize an array now.

Let's take an example.

`var` `marks` `[3]` `int` `=` `[3]` `int` `{10, 20, 30}`

- First, we'll be using our **var** keyword, then the *name of the array*, the size or the *length of the array*, the *data type*, and the **assignment operator**, which is equal to, again, the *length of the array*, the *data type*, and then our values.

- The number of values should always be **less than or equal** to the size of the array. If they are greater, the compiler will throw us an error.

- If lesser, the rest of the elements would be assigned zero value based on the data type mentioned.

So, we have initialized an array with values using these curly braces. 

Now, We can initialize an array also using the shorthand declaration. The syntax is simple.

`marks` `:=` `[3]` `int` `{10, 20, 30}`

We have an *array name*, the **shorthand declaration operator**, the *size of the array*, the data type, and our values. 

We can also initialize an array using ellipses.

`grades` `:=` `[…]` `int` `{10, 20, 30}`

We have a *name of the array*, the **shorthand operator**, these *three dots* over here in Golang are termed as ellipses. So, When we use these three dots, we need not specify the size or the length of our array. In this case, the compiler will implicitly calculate the length of the array based on the number of elements that we've specified.

Example :

```
package main
import "fmt"

func main() {

          var fruits [2]string = [2]string{"apples", "oranges"}
          fmt.Println(fruits)

          marks := [3]int{10, 20, 30}
          fmt.Println(marks)
        
          names := [...]string{"Rachel", "Phoebe", "Monica"}
          fmt.Println(names)

}

Output :

[apples oranges]
[10 20 30]
[Rachel Phoebe Monica]
```

---

## len()

- The length of the array refers to the number of elements stored in the array. We can even find the length of an array using a built-in length function.

- The len() function over here takes an array as an input and returns us the size of the array.

Example :

```
package main
import "fmt"

func main() {

           var fruits [2]string = [2]string{"apples", "oranges"}
           fmt.Println(len(fruits))
}

Output :

2
```

---

## index


![indss.jpg](/img/blog/lets-simplify-golang-part-2/75Q8xiYuq.jpg align="left")
- We know that an array is a collection of data elements of the same data type. In addition to this, an array is also numbered, and these numbers are called array index.

- The first element of an array has the index 0, while the last element has the index length minus one (len() - 1). So, If an array is of size five, the index of the last element will be four.

- We can access array elements using these indexes as well.

Let's say we want to access the element at index one. We can simply write
the name of the array and the index number enclosed within the square brackets.
` grades[1] `, this would give us the result 86, because that is the number specified at the index one.

> NOTE:-  The index should always lie between zero and length minus one, where length is the size or the length of the array. If it's lesser, or if it's greater, the compiler will throw us an error.

Example :

```
package main
import "fmt"
func main() {

           var fruits [5]string = [5]string{"apples", "oranges", "grapes", "mango", "papaya"}

           fmt.Println(fruits[2])
}

Output :

grapes
```

- We can even change the value of an array using the indices. In the below example, we have declared and initialized an array called grades. We first printed it, then we're going to change the value of the element at index one, then we're going to again print it. The value of the element at index one is 80, but then, later on, we have changed it to 100.

Example :

```
package main
import "fmt"

func main() {
            var grades [5]int = [5]int{90, 80, 70, 80, 97}
            fmt.Println(grades)

            grades[1] = 100
            fmt.Println(grades)
}

Output :

[90 80 70 80 97]
[90 100 70 80 97]
```

---

## looping through an array

Now let's see how we can loop through an array.

A simple for loop to loop through an array could be written like below.

```
for i := 0; i < len(grades); i++ {
    fmt.Println(grades[i])
}
```
- First, we have an initialization of a looping variable, which is **i**, then the condition that **i** has to be less than the length of the array. It starts from zero, but it always has to be less than the length of the array, and then we have a post condition of **i++**, which means we want to increment the value of **i** in every iteration.
- Now, inside a loop body, we are printing our array elements using the looping variable.

Example :

```
package main
import "fmt"

func main() {

          var grades [5]int = [5]int{90, 80, 70, 80, 97}

          for i := 0; i < len(grades); i++ {
               fmt.Println(grades[i])
          }
}

Output :

90
80
70
80
97
```

- Now we can also loop through an array using the **range** keyword. The range keyword is mainly used in for loops, to iterate over all the elements of an array, slice, or map. For arrays, range sets the scope of iteration up to the length of the array.

Example :

```
for index, element := range grades {
   fmt.println(index, ">=" , element)
}
```

- The syntax is simple, we have our **for** keyword, we have our *variables* that store the return values from the range expression, and we have the *shorthand operator* to declare and initialize these variables, and then we have a range expression, which consists of the range keyword and the array name.

 - In the case of arrays and slices, the first value returned is the index and the second value is the element itself.

Example :

```
package main
import "fmt"

func main() {
           
            var grades [5]int = [5]int{90, 80, 70, 80, 97}
            
            for index, element := range grades {
                fmt.Println(index, "=>", element)
            }
}

Output :

0 => 90
1 => 80
2 => 70
3 => 80
4 => 97
```
---

## Multidimensional Arrays

Until now, we've just discussed single-dimensional arrays, but we also have multi-dimensional arrays.

- A multi-dimensional array is an array that has more than one dimension.

- It's like an array of arrays or an array that has multiple levels.

- The simplest multi-dimensional array is the *2-d* array or two-dimensional array.


![multi.jpg](/img/blog/lets-simplify-golang-part-2/m2kZevyUb.jpg align="left")

In the above example, our main array consists of three elements, and all of these elements are an array itself and they consist of two elements themselves.

To access the element 64, we can simply write ` arr[2][1] => 64 `. This means that we want to first go to the element at the second index of our main array, and from that element, we want the element at the first index.

Let's take another example, to access element 4, we can simply write `arr[1][0] => 4`.
This means we want to first go to the element at index one of our main array, and from that particular element, we want the element at index zero. 

Example :

```
package main
import "fmt"

func main() {
     
            arr := [3][2]int{{2, 4}, {4, 16}, {8, 64}}
            fmt.Println(arr[2][1])

}

Output :

64
```
---

# Slice

A slice is defined as a continuous segment of an underlying array, and it provides access to a numbered sequence of elements from that area.

- Slices provide access to parts of an array in sequential order.
- They are more flexible and more powerful than arrays, since arrays had limitations of being fixed size.
- Unlike arrays, they are of variable type, i.e, you can add and remove elements from a slice.

A slice might look something like this.

We'll have an underlying array, and we'll slice it from a lower bound to an upper bound. Well, that's just how slices are in Golang.


![slic.jpg](/img/blog/lets-simplify-golang-part-2/hoqP96e9R.jpg align="left")

Let's dive deep to learn more about them.

A slice has three major components: **Pointer**, **Length**, and **Capacity**. 

- The pointer is used to point to the first element of the array that is accessible
through that slice.
> It is not necessary that the pointed element is the first element of the array.
Well, we will be studying pointers in detail later on, but pointers are just variables that hold memory addresses.

- The length of a slice is the number of elements it contains. 
- The capacity of a slice is the number of elements in the underlying array counting 
from the first element in the slice.
- The length and capacity of a slice can be obtained using the functions **len()**
for *length* and **cap()** for *capacity*.

---

## declaring and initializing a slice

The declaration is similar to creating an array, except that you don't need to specify the size of the slice.

Below is the syntax :

`<slice_name>` `:=` `[]` `<data_type>` `{<values>}`

First, we'll have the name of a slice, the shorthand operator, and empty square brackets, since we do not need to specify any size, the data type, and the values inside the curly braces.

What happens here is that an array is created first. After that, the compiler
will return a slice reference to it.

Example : ` grades := []int{10, 20, 30} `
It's an integer slice and it consists
of values 10, 20, and 30.

Example :
```
package main
import "fmt"

func main() {

           slice := []int{10, 20, 30}
           fmt.Println(slice)

}

Output :

[10 20 30]
```

Now, the core concept of the slice is a reference to the array. So, we can create a slice from an underlying array.

To create a slice from an array, we have a start index, and we have an end index.
`array[start_index : end_index]` 

Above is the way we create a slice. So, the element on the start index is included, but the element on the end index is not included. 
` array[0 : 3] ` it contains elements from zero index to index two.

> Note: if we do not mention the lower bound or the starting index, it's *zero by default*. ` array[ : 4 ] `
> Note: If we do not mention the lower bound and the upper bound as well, the complete array will be sliced for us. `array[ : ]`

Example :

```
package main
import "fmt"

func main() {
 
           arr := [10]int{10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
         
           slice_1 := arr[1:8]
           fmt.Println(slice_1)

}

Output :

[20 30 40 50 60 70 80]
```
We can even declare and initialize a slice using another slice -
` sub_slice := slice[0:3] `


There's one more way of declaring a slice, and that is through the **make** function.

` slice := make([]<data_type>, length, capacity) `

The **make** takes three parameters, the data type, the length, and the capacity. (capacity is optional)

Generally, the **make** function is used to create an empty slice.
Example :- ` slice := make([]int, 4, 8) `

In the above example, we've created a slice with a length of five and a capacity of 10, and the slice is of integer data type.

Example :

```
package main
import "fmt"

func main() {

        slice := make([]int, 4, 7)
        fmt.Println(slice)
        fmt.Println(len(slice))
        fmt.Println(cap(slice))

}

Output :

[ 0 0 0 0 ]
4
7
```

---

## Appending to a slice

It is common to append new elements to a slice. For this, Go provides us with a built-in append function. 

```
func append(s []T, vs ...T) []T

```

According to the documentation of this function, this function could be described as follows:
- The first parameter of append is a slice of some data type and the rest are the values
of the same data type.
- The resulting value of this append function is a slice containing all the elements of the original slice plus the provided values.
- Now this new slice that will be returned will have two times the initial capacity, if the initial capacity could not contain all the elements.
- The returned slice will point to the newly allocated array as well

Syntax: 
```
slice = append(slice, element-1, element-2)
```

To append to a slice, we simply mention the slice name, and then the values of the elements that we want to insert.

Example: 
```
slice = append(slice, 10, 20, 30)
```

Example:
```
package main
import "fmt"

func main() {

        arr := [4]int{10, 20, 30, 40}
    
        slice := arr[1:3]

        fmt.Println(slice)
        fmt.Println(len(slice))
        fmt.Println(cap(slice))

        slice = append(slice, 900, -90, 50)

        fmt.Println(slice)
        fmt.Println(len(slice))
        fmt.Println(cap(slice))
}

Output:

[20 30]
2
3
[20 30 900 -90 50]
5
6
```

We can even append a slice to another slice by simply using the three dots.
below is the example.

```
slice = append(slice, anotherSlice...)
```

Example :
```
package main
import "fmt"

func main() {

        arr := [5]int{10, 20, 30, 40, 50}
   
        slice := arr[:2] 

        arr_2 := [5]int{5, 15, 25, 35, 45}

        slice_2 := arr_2[:2]

        new_slice := append(slice, slice_2...)

        fmt.Println(new_slice)

}

Output:

[10 20 5 15]
```
---

## deleting from a slice

We can even delete elements from a slice by creating a new slice that does not consist of the element that needs to be deleted.

Let's take an example, how can we do it :

`arr := [5]int{10, 20, 30, 40, 50}`

Let's say we want to delete the element at index two. So, what we can do is we can create a slice that consists of elements from index zero and one, and that consists of element from index three and four, and then we simply append them together.

Example:

```
package main
import "fmt"

func main() {
 
        arr := [5]int{10, 20, 30, 40, 50}

        i := 2

        fmt.Println(arr)

        slice_1 := arr[:i]
        slice_2 := arr[i+1:]

        new_slice := append(slice_1, slice_2...)
        fmt.Println(new_slice)
}

Output:

[10 20 30 40 50]
[10 20 40 50]
```
---

## copying from a slice

We also have a built-in copy method to copy elements from one slice to another. This built-in copy function copies elements into a destination slice from a source slice.

`func copy(dst, src []Type) int`

`num := copy(dest_slice, src_slice)`

---

# Map

- A map is a data structure that provides you with an unordered collection of key-value pairs.
- They are also called Hash Tables in java and dictionaries in python.
- You will store values into the map based on a key.
- They are used to looking up a value by its associated key. 
- The strength of a map is its ability to retrieve data quickly based on the key. It provides efficient **add**, **get** and **delete** operations.


![mappp.jpg](/img/blog/lets-simplify-golang-part-2/jGFJn5jRm.jpg align="left")
        
---

## declaring and initializing a map

Syntax:
```
var <map_name> map[<key_data_type>]<value_data_type>
```
First, we have our var keyword, the name of the map, the map keyword, which is necessary to create a map, then the data type of the key, which we have to mention inside the square brackets, and then the data type of the value.

Example:
```
 var my_map map[string]int
```
Declared a map with key type as string and with value of integers.

> Note: Above example will create a nil map, In maps, the zero value of the map is nil, and a nil map does not contain any key. So, If you try to add a key-value pair in a nil map, the compiler will throw us a runtime error.

To create maps with key-value pairs, we need to initialize it as well.
Below is the syntax for declaration and initialization of a map:
```
<map_name> := map[<key_data_type>]<value_data_type>{<key-value-pairs>}
```

First, we have the name of our map, then the shorthand operator, then the map declaration with key and value data types, and then the key-value pairs inside curly braces.

Example:
```
codes := map[string]string{"en": "English", "fr": "French"}
```

We can also declare and initialize a map using the **make** function. The make function takes argument, the type of the map, and it returns us an initialized map.

Example:

```
package main
import "fmt"

func main() {

        /* When we print the map,
           we get an empty map in the output. */       

        codes := make(map[string]int)

        fmt.Println(codes)'

}

Output:


map[] 
```
---

## length 

- To determine how many items or key-value pairs a map has, we use the built-in length function. (   **len()** )
- The length function will return zero for an uninitialized map,

Example:
```
codes := map[string]string{"en": "English", "fr": "French", "hi": "Hindi"}

fmt.Println(len(codes))

Output:
3
```

---

## accessing a map

We can also access the items of a map by referring to its key name simply by specifying the name of the map and writing its key name inside the square brackets. ` map[key] `

Example:

```
package main
import "fmt"

func main() {
 
        codes := map[string]string{"en": "English", "fr": "French", "hi": "Hindi"}

        fmt.Println(codes["en"])
        fmt.Println(codes["fr"])
        fmt.Println(codes["hi"])

}

Output:

English
French
Hindi
```
---

## getting a key

- When we talk about getting a key while talking about maps, we mean getting the value associated with the key.
```
value, found := map_name[key]
```

- When you index a map in Go, you get two return values. The **first** is the **value**,
and the **second** value, which is a Boolean value that shows whether or not the key exists and is optional.

Example:
```
package main
import "fmt"

func main() {

         codes := map[string]int{"en": 1, "fr": 2, "hi": 3}

         value, found := codes["en"]

         fmt.Println(found, value)

         value, found = codes["hh"]

         value, found = codes["hh"]

}

Output:

true 1
false 0
```

---

## adding key-value pair

Adding an item to the map is done by using a new index key and assigning a value to it. ` map[key] = value `

Example:
```
package main
import "fmt"

func main() {
 
        codes := map[string]string{"en": "English", "fr": "French", "hi": "Hindi"}

        codes["it"] = "Italian"

        fmt.Println(codes)

}

Output:

map[en:English fr:French hi:Hindi it:Italian]
```

---

## update key-value pair

- We can even update the value of a specific item by referring to its key name.
- In maps, if you try to add an already existing key, then it will simply override or update the value of that key with the new value.

Example:
```
package main
import "fmt"

func main() {
 
        codes := map[string]string{"en": "English", "fr": "French", "hi": "Hindi"}

        codes["en"] = "Maths"

        fmt.Println(codes)

}

Output:

map[en:Maths fr:French hi:Hindi it:Italian]
```

---

## delete key-value pair

- To delete a key-value pair from a map, we have a built-in delete method.
- It takes the name of our map and the name of the key that we want to delete.
` delete(map, key_name) `

Example:
```
package main
import "fmt"

func main() {
 
        codes := map[string]string{"en": "English", "fr": "French", "hi": "Hindi"}//

        fmt.Println(codes)

        delete(codes, "en")

        fmt.Println(codes)

}

Output:

map[en:English fr:French hi:Hindi]
map[fr:French hi:Hindi]
```

---

## iterate over a map

- Now for looping or iterating over a map, the range expression returns the key and the value. 
- for slices and arrays, it returns as the index
and the element itself. While for maps,
it returns as the key and the value.

Example:
```
package main
import "fmt"

func main() {

        codes := map[string]string{"en": "English", "fr": "French", "hi": "Hindi"}

       for key, value := range codes {
             fmt.Println(key, "=>", value)
       }
}

Output:

en => English
fr => French
hi => Hindi
```
---



[CHEAT SHEET](http://www.cheat-sheets.org/saved-copy/go-lang-cheat-sheet-master.20181212/golang_refcard.pdf)

[EXERCISES](https://golangr.com/exercises/)


Thank you for a reading mate, If you enjoyed this article, please like, comment, and share it. 

Connect with me on :
- [Twitter](https://twitter.com/barkatul_20)
- [LinkedIn](https://www.linkedin.com/in/barkatul-mujauddin-3a67771b8/)

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.


