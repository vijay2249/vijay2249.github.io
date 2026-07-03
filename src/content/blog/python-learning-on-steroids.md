---
title: "Python Learning on Steroids"
description: "Going hands-on with networking and security in Python — sockets, packets, and learning a language by actually building with it."
date: 2024-03-25
category: tutorial
tags:
  - python
  - networking
  - security
  - learning
cover: /images/python-networking-cover.svg
coverAlt: "Python networking and security code"
---

Recently i am going through Network and Security in Python book and wanted to write and test the scripts myself.

Along the way I wanted to learn and code using Vim editor. 

So my target is this

1. Continue learning Vim - there is a great tutorial by fireship (search for "fireship vim tutorial") in youtube I am not giving any details/tricks about Vim, that video explain better than me.

2. I want to keep all my notes at a single place. In a single file is much better.

3. Along the way I also want snippets of code in between my notes lets call it NOTES.MD

> At the bottom of the page you can find the link to github repository where this is used in practice.

All the things started well, until one moment when i coded my first basic script and then wanted to code the second script and run it.

Essentially I need to create a new file to execute the second piece of code but need to keep my notes in a single file and also need to attach code snippets in NOTES.MD

Its just irritating to create multiple files and also to copy paste the same code snippet in NOTES.MD also its just repetition work, which is one thing i hate to do the most as i am lazy.

> **Putting on thinking hats**

I found a way to solve this problem

The notes -> write them in the comments

All the scripts write them in a function and call the respective function to execute the respective method/function/script

An example will be like this

```python
import os

'''
    os.walk(path) 
navigates all the directories in the provided path directory, and
returns three values: _the path directory_, _the names of sub-directories_, _list of filenames in
the current directory path
'''

def os_walk():
    file_count = 0
    for root, directories, files in os.walk(".", topdown=False):
        file_count += len(files)
        for file in files:
            print(f"[+] {os.path.join(root, file)}")
            for sub_folder in directories:
                print(f"[+][+] {sub_folder}")
    print(f"[=] Total files in the current directory: {file_count}")

if __name__ == '__main__':
    os_walk()
```

Now from the above code snippet, I have my notes about something also the code snippet which i can call from the main method.

If the function needs some arguments then we provide them from the main function as well.

All is well and good to go.

BUT WAIT 
We can still enhance this right??

Thinking about this, the problems we face every time we run the new function are
- We need to modify the main function logic to call the necessary function
- Also we have to keep in mind that we might not be knowing before hand the parameters that a function needs. (in my case this is one of the issue, since we are the ones defining the function we might not face this issue, but i want to solve this as well)

Points to note
1. User will provide which function to execute
2. User will provide necessary arguments/parameters via command line arguments

So the command should be 
```bash
python main.py -f some_random_function --args "{'args1':'values'}"
```

This command should execute the `some_random_function` with arguments as 'args1' which value is 'values'

To capture the command line arguments lets use `optparse`

```python
from optparse import OptionParser

def capture_arguments():
    parser = OptionParser()
    parser.add_option("-f", dest="function", help="Function to execute")
    parser.add_option("--args", dest="args", help="Arguments needed for functions to execute", default={})
    return parser.parse_args()
```

Now we have to modify the main method to call the respective function that user mentions via command line arguments

Now to call the main method from the function we need to use the `globals` function that is provided by python.

Python `globals()` function is a built-in function in Python that returns the dictionary of the current global symbol table.

A symbol table is a data structure that contains all necessary information about the program such as variables, methods, classes etc...

If we want to call a function say `sum` we can use globals function to call the sum function as `globals()['sum']()`

In this manner, we are passing which function to execute via command line arguments which we are capturing via optparse library, which returns the arguments and its parameters.

defined below is the code snippet for the main function which call the function and executes the function that we provide via command line arguments.

```python
if __name__ == '__main__':
    (options, args) = capture_arguments()
    func = options.function
    print(f"[=] Executing {func} function")
    globals()[func]()
```

This is all working good.

What if we need some parameters. Sure we can call `input()` function whenever these values are required within the function call itself.

But I want to pass parameters from cli itself. (Another enhancement)

Lets begin another journey.

Since we dont know the amount of arguments and the positional arguments that are required by the function we send "_kwargs_" to the function as parameters.

```python
def random_function(**kwargs):
    #some code
    arg = kwargs.get('arg', None)

if __name__ == '__main__':
    (options, args) = capture_arguments()
    func = options.function
    args = options.args
    print(f"[=] Executing {func} function")
    globals()[func](args)
```

But the above snippet wont work. The function is expecting dictionary of positional arguments but we giving a string input which then throws _TypeError_ error

To resolve this, lets convert string to dictionary using `eval()` function
```python
args = eval(options.args)
```

This is done, but still we are facing issues that if we run this code we will get error stating that random_function() is not exepecting any positional arguments.

For this we convert the args again as 
```python
args = **eval(options.args)
```
This is similar to 
```python
def func(arg1=value1, arg2=value2):
    #--- snip----

args = {'arg1':'value1', 'arg2':'value2'}

def func(**args):
    #--- snip----
```

The above code snippets represents they way we can pass the keyword arguments as a dictionary.

so we can modify our main method code as

```python
if __name__ == '__main__':
    (options, args) = capture_arguments()
    func = options.function
    print(f"[=] Executing {func} function")
    args = **eval(options.args)
    globals()[func](args)
```

Now still there is one more issue pending, <br/>
Not all the functions require arguments to execute the code within it.

So we include try except block in our main method <br/>
The function that receive unexpected arguments results in `TypeError` error

```python
if __name__ == '__main__':
    (options, args) = capture_arguments()
    func = options.function
    print(f"[=] Executing '{func}' function")
    try:
        print("[=] Trying to execute function with passing arguments")
        globals()[func](**eval(options.args))
    except TypeError as error:
        print("[=] Executing function without passing arguments")
        globals()[func]()
```


Hence the problem resolved.

Now you can create multiple functions in the same file and pass in the respective method name and arguments to execute the specific section of code.

We can extend this to multiple files as well

Create a sample files called sample.py and sample2.py <br/>
And write some dummy functions in both the files. Say def1, def2 in sample.py file and def3, def4 in sample2.py

Now create a main.py file and add the below contents in the file

```python
from sample import *
from sample2 import *

from optparse import OptionParser

def capture_arguments():
    parser = OptionParser()
    parser.add_option("-f", dest="function", help="Function to execute")
    parser.add_option("--args", dest="args", help="Arguments needed for functions to execute", default={})
    return parser.parse_args()

if __name__ == '__main__':
    (options, args) = capture_arguments()
    func = options.function
    print(f"[=] Executing '{func}' function")
    try:
        print("[=] Trying to execute function with passing arguments")
        globals()[func](**eval(options.args))
    except TypeError as error:
        print("[=] Executing function without passing arguments")
        globals()[func]()
```

Now to execute function def1 with arguments `val=[1,2], out=False` we can run the command

```bash
python main.py -f def1 --args "{'val':[1,2],'out':False}"
```

There you go.

Some python steroids drugs which you might not need at all in your lifetime. :)

Link to code -> [Python_On_Steroids](https://github.com/vijay2249/random-stuff/tree/random/Python_On_Steroids)

---

*Originally published on [dev.to](https://dev.to/vijay2249/python-learning-on-steroids-ih1).*
