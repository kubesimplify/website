---
title: "Important concepts of Operating Systems"
datePublished: 2022-06-14T12:33:06.718Z
slug: important-concepts-of-operating-systems
author: dipankar-das
cover: /img/blog/important-concepts-of-operating-systems/w4pykhnV9.jpeg
tags: ["operating-system", "linux", "thread", "os", "process"]
cuid: cl4e5afql00j40vnv2rixby6t
---
# What is it
The operating system is a set of programs that acts as an interface between a User and Hardware. It is necessary to reduce complexity

## Modes in an OS
1. User mode
2. Supervisor mode (i.e. Kernel-mode)

user applications are provided APIs by the OS to talk with the hardware.

How does the Computer Boots


![boot.png](/img/blog/important-concepts-of-operating-systems/VxyRbtNE3.png align="left")

for example.
How the print statement is evaluated in an Operating System

![01.png](/img/blog/important-concepts-of-operating-systems/UoKfG0J2j.png align="left")

## Components
1. Process management
it manages the processes and their resources
1. File management
it manages the file Read, Write, Execute, Permissions and sharing
1. Memory management
it counts how much is free, makes memory available & deadlock, and memory isolation, mapping
1. I/O management
it handles interrupts, device drivers, bus, buffers, etc


# What is Process 
a process is the instance of a computer program that is being executed by one or many threads.
OS represents each process tracked with PCB (Process Control Block)
* Process ID (**Linux,** it is represented by 16 bits)
* Parent process ID
* Process state
* CPU State
* Scheduling information
* Memory information
* Open file information

## Components

1. OS Resources
it contains the information
* Open file information
* Socket information
* Scheduling algorithm to be used
* PID, etc.

2. Address Space
![addrSpace.png](/img/blog/important-concepts-of-operating-systems/wJNhzC6_U.png align="left")

3. CPU State
all the CPU registers associated with the process
it stores the current state
PC=program Counter
IP=Instruction pointer
SP=stack pointer
it is useful when there is a context switch as the CPU stores the current state of the process into this segment
and after storing it then it switches to the new process

## Creating of New Process
we can use `fork()` to create a child process
it's important to note that when fork() is invoked, the parent process address space is copied to the child process

## Zombie & Orphan Processes
Orphan Process - When the parent process gets completed before the child process then child process control is transferred to the *init* process in Linux kernel and so the child has a parent process ID of 1 or in more recent Linux kernel it is 2 or 3

Zombie Process - When the parent process is busy in some I/O or in a sleeping/suspending state then if the child process gets completed then the parent process does not know about

we can use the wait() in parent block so that parent waits for its child process to get terminated before it gets terminated

## InterProcess Communication(IPC)
Here, we use a pipe structure to communicate between processes
it uses 2 heads a read and write

in Golang, channel is used to communicate in a GoRoutine

# Process scheduling


![process-diagram.png](/img/blog/important-concepts-of-operating-systems/pJKQHFQ-E.png align="left")

the program that takes the responsibility of moving process from one queue to another
## Types
1. Short Term Scheduler - it decides which process moves from Ready queue to running state(CPU), it is called by:-
  * **Interrupt Service Routine**
  * **When a process terminates**
  * **I/O operation is invoked**

2. Long Term Scheduler -  it decides which process moves from Embryo State/Ready_Suspended state to Ready Queue
3. Mid-Term Scheduler - used for swap area. But some don't use as long term can be extended to fit its purpose 

> Context switch - mechanism to change the control of the CPU from one process to another

> Preemptive - control can be transferred to another process even if the process is not completed 

> Non-preemptive - control can be transferred to another process when the process is completed

## Scheduling Algorithms
1. **FCFS (First Come First Serve) [nonpremeptive]**
the process which comes first gets the CPU first (arrival time)

2. **SJF (Shortest Job First) [premptive/nonpremptive]**
it is not practical
scheduler decides according to the remaining burst time required by the process

3. **Priority-based [premptive/nonpremptive]**
each process is given priority
the lower priority process is given the preference
to avoid starvation we can use the aging method where at each clock cycle the priority of processes in queue is reduced

4. **Round Robin [premptive]**
Here there is a fixed Quantum time
it's like a circular queue where each process gets a Qt amount of time, if not completed then it is reinserted at the back
and the process after this is given to the CPU
it has the least waiting time. So used in interactive tasks (UI)

### Hybrid of these are there
5. **Round Robin with priority**
Here it compares the priority of the runnable process with other runnable processes
6. **Multilevel feedback Queue**
ready queue is divided into >= 2 queues
1st queue = Highest Priority (Interactive processes like UI)
latest queue = Lowest priority (Background processes)
and another queue for the (system process)

# Thread
It is a lightweight process
Every thread uses the address space of its parent
it takes significantly less time and resources as compared to creating a new child process
each thread has its own:
* PC (Program Counter)
* CPU state
* Stack (Address space)
the stack is stored in the parent process Heap address space

## Types
* **user thread** - it is in user space and is handled by the programming language
* **kernel thread** - it is in kernel space and is handled by the Operating System
to execute a user thread, it is transferred to kernel threads to execute it

# Process Synchronization / Concurrency
There is a problem when there are > 2 processes; execute simultaneously and using common resources then there are inconsistencies
This is Race Condition

there are 3 steps in each process
```
acuire_lock()
----
Critical section # where all the program logic happens
----
release_lock()
``` 

## Solutions
1. **Software Lock(Peterson's 2 process solution)**
If there are P0 and P1 processes, then P0 gives chance to P1 and vice-versa, thereby maintaining consistency

```cpp
// Process 0
flag[0] = True
turn = 1;

while (flag[1] == True && turn == 1);
```

```cpp
// Process 1
flag[1] = True
turn = 0;

while (flag[0] == True && turn == 0);
```

2. **Semaphores**
Semaphore is a variable along with 2 operators called wait() and signal() to achieve synchronously
 ** Types**
  * *Binary* - only one process at a time can enter the critical section
  * *Counting* - more than one process at a time can enter the critical section
If one or more processes are waiting to get their turn thereby CPU burst time is wasted to check them, so it is a spin lock situation
to overcome, we need the waiting queue
#### Bakery using semaphore
multiple producers can put their item on the rack, and multiple consumers can eat item

```cpp
// Producer
wait(empty)
  wait(mutex)
    insert(rack, p_item)
  signal(mutex)
signal(full)

// Consumer
wait(full)
  wait(mutex)
    remove(rack)
  signal(mutex)
signal(empty)

```

#### Reader & Writer method
When one or more process enters reading mode, then no process can enter write mode in the critical section
and when the write mode process is inside the critical section, no read mode process is allowed to enter
only 1 write mode by N read mode

```cpp
// writer
wait(wr)
  write()
signal(wr)

// reader
wait(mutex)
  count++
  if (count == 1)
    wait(wr)
signal(mutex)

read()

wait(mutex)
  count--
  if (count == 0)
    signal(wr)
signal(mutex)
```

#### Dinning philosopher
```python
# philosophere
think()
# aquire_chopsticks
eat()
# release_chopsticks
```
```cpp
enum STATE{
  HUNGARY, EATING, THINKING
}
semaphore p[5] = {0}
mutex = 1
int state[5]

void philosopherWork(int i) {
  while (1) {
    think(i)
    takeChopsticks(i)
    eat(i)
    releaseChopsticks(i)
  }
}

void takeChopsticks(int i) {
  wait(mutex)
    state[i] = HUNGARY
    test(i)
  signal(mutex)
  signal(p[i])
}
// 4 Philosopheres
void test(int i) {
  if (state[i] == HUNGARY && state[(i+1) % 5] != EATING && state[(i+4) % 5] != EATING) {
    state[i] = EATING
    signal(p[i])
  }
}

void releaseChopsticks(int i) {
  wait(mutex)
    state[i] = THINKING
    test((i+1) % 5)
    test((i+4) % 5)
  signal(mutex)
}
```

3. Monitors
it is a high-level programming language construct to achieve synchronously
***Block***
  * lock
  * shared variable
  * atomic function
  * conditional variables


# Deadlock
a set of processes are said to be in deadlock if every process belongs to this set holds a resource and waiting for another resource that is currently held by another process belongs to this same set

## handling
1. **Deadlock prevention - prior to deadlock**
make anyone of the following truth:
  * no mutual exclusion
  * no hold & wait
  * no preemption
  * no circular wait

2. **Deadlock avoidance - prior to deadlock**
dynamically verify the resource allocation state
using:- Allocated resource count, available resources, need of that process
  * single instance resource - resource allocation graph
  * multiple instance resource - bankers algorithm

3. **Deadlock detection - deadlock occurred**
the system has to know the information to find deadlock like - allocation, request, availability
  * single instance resource - Wait for graph
  * Multiple instance resource - Banker's algorithm

4. **Deadlock recovery - deadlock occurred**
how to resolve it
  * assume that there is no deadlock
  * resource preemption
    * process termination (all or some selected till it is deadlock-free)

# Memory management
functions of it:-
* keep track of free space
* allocation memory to process whenever they need it
* protection of memory of one process from another

creation of executable file
* without linking
* with linking
  * static linking - the library files are added after the linking process
  * dynamic linking - the library files are fetched as needed during execution

> Virtual Memory - it is used to expand the available memory resource than it is. 

## Mapping of instructions
1. **Compile time-binding**
each line mapped to the physical memory
The compiler must know where the space is available 
![compileb.png](/img/blog/important-concepts-of-operating-systems/hEZuNHbN6.png align="left")

2. **Load time-binding**
Base register is provided by the OS and 
Base register + index gives the physical memory
![loadb.png](/img/blog/important-concepts-of-operating-systems/wI1wCnP5Q.png align="left")

3. **Execution time-binding**
during the execution, the instruction can move from one memory location to another

## Types of allocation
> logical address - it is the address generated by the CPU which is the virtual memory location

> page table - it is used for mapping virtual page number <-> physical frame number

> number of bits to represent page number = number of pages; same for the offset where number of lines or size of each page

> each page size == each frame size

* Monoprogramming systems (compile time-binding )
* Multiprogramming 
  * Contiguous
    1. Fixed partitioning
      whole physical memory is divided in fixed-sized chunks. It causes internal fragmentation
    1. Variable partitioning
      Physical memory is not divided, but the program is stored in a continuous memory location of its size. It causes external fragmentation
	  
  * Non-contiguous
  1. **Paging**
      * **Single page table**
	![singleptb.png](/img/blog/important-concepts-of-operating-systems/qM7_UWiUY.png align="left")
	the page table is typically stored in the RAM and most recent in the MMU. TLB (Translation Look-Aside Buffer) act as the fastest cache for page number with corresponding frame number, it reduces the access time. Very fast cache directly on the CPU that caches most recent virtual to physical address translations. Implemented as a fully associative cache
	
	 * **Multiple page table**
![multiptb01.png](/img/blog/important-concepts-of-operating-systems/N2Rk2c-Ab.png align="left")
![multiptb02.png](/img/blog/important-concepts-of-operating-systems/zn2V8_W65.png align="left")

   2. **Segmentation with paging**
    as the process address block is segmented into 4 segments and each segment is divided into pages and each page into lines
d is decomposed into p and d'
    
![seg01.png](/img/blog/important-concepts-of-operating-systems/wULFiuQjo.png align="left")

## additional bits of Page table
* valid bit
1 -> valid if the program uses the page, otherwise 0

* protection bit
read, write, execute
code segment must be read, execute
data segment must be read, write
* Reference bit
whether this page is currently accessed in CPU or not 
even reading or writing is known here as refereed
* dirty bit
if that page is modified in the ram but not written back to the virtual memory, then dirty bit is set to 1
so when the page has to be removed from the ram then:
if the dirty bit == 1 then
  it is saved to the swap area
else
  it is saved to the hard drive

## Replacement algorithm
it happens in demand paging
when during the segmentation paging the page is not present in the ram then "PAGE FAULT" exception is thrown
OS handles the exception by bringing that page from the disk/swap -> RAM

1. FIFO - the first one in has to be replaced
2. optimal - in the near future, whichever page is not going to be used
3. LRU - replace with the page which has not been used recently
4. Approx LRU
  * uses the reference bit. If reference bit = 0 then replace it; otherwise not
	1. Additional reference bit algorithm
	2. Second chance algorithm
	3. Counting algorithm

# IO
## Disk

![disk.png](/img/blog/important-concepts-of-operating-systems/LM2BrUdSf.png align="left")
1. sector/block - A sector is the basic unit of data storage on a hard disk
2. Head - this is the surface of the platter in a disk, there are 2 surfaces
3. track - a combination of sectors, creating a ring
4. cylinder - all the tracks under the head at a given point on all surface

## Scheduling in Disk
Disk Latency = Seek Time + Rotation Time + Transfer Time
the goal is to Reduce seek time
Scheduling technique:
1. FCFS
the first request is served
2. SSTF
the least movement of the disk arm from its current position
3. SCAN
start scanning in the same direction till 0 and then scan in the reverse direction
5. LOOK
like scan, but does not go to the extreme ends.
4. C-SCAN
similar to SCAN but moves in one direction L->R or R->L

6. C-LOOK
similar to LOOK but moves in one direction L->R or R->L

## How files are stored (Linux File System) 
it uses Inode
where single Indirect, double Indirect, triple Indirect is by multi-level indexing
```Cpp
// just to give an ideal
struct prem {
  int read, write, exec;
};

struct file {
  struct prem mode;
  String owner;
  time timestamps;
  int block_size;
  int count;
  struct fs *directBlock;
  struct fs_1 *singleIndirect;
  struct fs_2 *doubleIndirect;
  struct fs_3 *tripleIndirect;
};

struct fs {};
struct fs_1 {
  struct fs **data; // array of pointers for the implementation of m binary tree
};
struct fs_2 {
  struct fs_1 **data; // array of pointers
};
struct fs_3 {
  struct fs_2 **data; // array of pointers
};
```

now the directory structure is an acyclic graph
* 2 or more directory entries can point to the same file or subdirectory
* can create links (symbolic & hard)

## Hard Link
gives different names to the existing file that all refer to the same content

**cons**
cannot link across file systems

## Soft Link
a symbolic link is a file that contains the name of another file or directory
OS searches the Inode of the original file based on the file name

**cons**
deletion or moving the file causes the links to break


## Components
* I/O device
* I/O controller - the interface between the I/O devices and the internal system components; CPU, memory, etc
* I/O bus

The CPU interacts with the I/O controller through a set of interface registers called the I/O port.
I/O port
consists of four registers, called the *status, control, data-in, and data-out registers*.
* **Control register** - The control register can be used to give the command.
* **Status Register** - whether the current command has been completed or not, whether a byte is available to be read or not, Indication of device error.
* **Data-in register** - read by the host to get input.
* **Data-out register** - written by the host to send output.

**DMA (Direct Memory Access)** - DMA module controls the exchange of data between the main memory and an I/O module. It helps in reducing the CPU time by allowing the CPU to execute other processes while it transfers data across I/O devices

Device Driver - it is usually part of the OS kernel that contains the device-specific code to control an I/O device, which device manufacturer usually writes

# Buffers
Buffer is used to speeding up the process because the I/O was significantly slower than the CPU, so the CPU had to wait.
* Single buffer
* Double Buffer
* circular buffer

# Protections & security
Protection happens inside a computer, whereas Security considers external threats.
## Components involved in protection

* Subjects
  * user, process, procedure, etc.
* Objects
  * files, printer, Disk writer, etc.
* Operations
  * read, write, etc.

Reference monitor validates access to objects by authorized subjects

Protection domain
* user
* supervisor

access matrix is used, it is a set of operations that a process executing in domain(i) can perform on Object(i)

# Conclusion
Hope this blog gives you the basic overall idea of the Operating System
Happy learning 📖

Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](https://kubesimplify.com/discord) server to learn with us.