---
title: "Get Ready for Wasm Day at Kubecon NA 2023!"
datePublished: 2023-10-28T12:30:09.347Z
slug: ready-for-wasm-day-2023
author: chad-m-crowell
cover: /img/blog/ready-for-wasm-day-2023/02e09c4c-10ae-4ff3-9993-d558450377c4.png
tags: ["webassembly", "kubernetes", "devops", "wasm", "kubecon"]
cuid: cloa0sern000108js39wp0pb7
---
We're all gearing up for Wasm Day at Kubecon NA in Chicago, IL on November 6th, 2023! Wasm Day is a full day dedicated to all things WebAssembly, where like-minded wasm wizards gather to discuss, explore, and push the boundaries of this amazing technology. Whether you're a seasoned wasm expert or just dipping your toes into the wasm waters, this article aims to prepare and excite you for Wasm Day!

Not only will there be leading experts and enthusiasts from around the globe to share knowledge with, but also you'll be able to try out the latest and greatest wasm demos, build your own Wasm projects, and learn how to use the new Web Assembly Studio tooling. [Check out the full Wasm Day schedule here](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/co-located-events/cloud-native-wasm-day/).

%[https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/co-located-events/cloud-native-wasm-day/] 

---

## What is Wasm?

This versatile technology is revolutionizing the way we write and run code, offering lightning-fast performance, cross-language compatibility, and so much more! At its core, wasm is a low-level bytecode format that serves as a universal binary instruction set for web browsers and cloud-native web apps. In simple terms, it's a way to write high-performance code in programming languages like C++, Rust, or even Python, and run it directly in the browser or runtime environment at near-native speeds. This means that you can write complex applications with low overhead, fast load times, and high performance.

Wasm is a compact binary instruction format for compiling code to a portable target. This compiled binary, called a "module", can run in any place that includes a Wasm runtime. By design, these modules run in a sandboxed environment. They only have access to its memory and the resources granted by the runtime.

In the context of Kubernetes, Wasm is particularly useful for running serverless applications. Serverless applications are event-driven and automatically scale in response to demand. Traditionally, serverless applications have been written using runtime-specific frameworks or languages, which limit portability and require developers to learn multiple programming environments. Wasm solves this problem by providing a platform-agnostic runtime environment for serverless applications, enabling developers to write code in any language and execute it within a Wasm runtime. Before you come to Wasm day, I would check out this article that provides more detail on how [*Kubernetes and Wasm are better together*](https://www.cncf.io/blog/2022/11/17/better-together-a-kubernetes-and-wasm-case-study/).

To run Wasm applications in Kubernetes, several components are needed, so I highly encourage you to check out [*WebAssembly on Kubernetes: everything you need to know by Nigel Poulton*](https://nigelpoulton.com/webassembly-on-kubernetes-everything-you-need-to-know/)*.*

%[https://nigelpoulton.com/webassembly-on-kubernetes-everything-you-need-to-know/] 

---

## WasmCon 2023

Did you miss out on the latest WasmCon event in September? No worries, because I've got all the highlights right here for you! Developers at the event talked about the many benefits of using WebAssembly, such as improved performance, portability, and security. They also shared exciting updates on projects like Wasi, which is helping to make it easier to run WebAssembly code outside of the browser.

[Christoph Voigt](https://christophvoigt.com) gave an excellent racap of the event, including his list of top talks from the event. [Check it out here](https://christophvoigt.com/posts/wasmcon-2023-recap/).

Additionally, at WasmCon, [Angel M De Miguel Meana of VMware](https://www.linkedin.com/in/angelmmiguel/) and [Justin Cormack of Docker](https://www.linkedin.com/in/justincormack) gave a great talk called "[*Develop Wasm Applications with Docker*](https://youtu.be/xPO3-TOZxW0?si=qoIcleGwhq94LeQH)". In this talk, they explore how containers and WebAssembly can work together to unlock the potential of both technologies. By watching this, you will learn how to mix and match containers and Wasm modules and the benefits of doing so. You will learn how to run your first projects using your favorite language with WebAssembly. [Watch this talk here](https://youtu.be/xPO3-TOZxW0?si=qoIcleGwhq94LeQH).

%[https://youtu.be/xPO3-TOZxW0?si=qoIcleGwhq94LeQH] 

By far, the most viewed talk at WasmCon was by [Luke Wagner, Distinguished Engineer at Fastly](https://github.com/lukewagner) called "[*What is a Component (and Why?)*](https://youtu.be/tAACYA1Mwv4?si=z3ROX0uIB2wgkTno)". In this talk, Luke defines what a component is, how it relates to other things we're familiar with, and what sorts of new powers components unlock for us in the future. [Watch it here](https://youtu.be/tAACYA1Mwv4?si=z3ROX0uIB2wgkTno). Luke's talk also includes a live demo of a component-based web app that uses React and Redux.

%[https://youtu.be/tAACYA1Mwv4?si=z3ROX0uIB2wgkTno] 

---

## Top 10 Wasm Resources

In rapid-fire fashion, I will now present the top 10 resources to help you become a wasm wizard in no time, and get hands-on and involved with the WebAssembly community:

1. **MDN Web Docs** 📚: A comprehensive guide from the Mozilla Developer Network, covering everything wasm-related. This is your go-to resource for getting started.
    
    %[https://developer.mozilla.org/en-US/docs/WebAssembly] 
    
2. **WebAssembly Weekly** 📰: Stay up to date with the latest news, tutorials, and projects surrounding wasm with this awesome newsletter.
    
    %[https://wasmweekly.news] 
    
3. **WebAssembly.org** 🏗️: Find resources to contribute and collaborate with others. Find the official newsletter or join the Discord!  
    [webassembly.org](https://webassembly.org/community/resources/)
    
4. **Rust and WebAssembly** 🦀🕸️: Dive into the world of wasm with Rust, a modern systems programming language known for its low-level control and safety features. This book by Mozilla will have you feeling like a wasm pro in no time.  
    [The Rust and WebAssembly Book](https://github.com/rustwasm/book)
    
5. **A WebAssembly Collection** 🚂: Resources from the Chrome team, to help you on your WebAssembly journey, including WebAssembly in practice and case studies!  
    [WebAssembly Resources from the Chrome Team](https://web.dev/explore/webassembly)
    
6. **WebAssembly by Example** ✍️: Learn by doing! This collection of hands-on projects, complete with code samples, will help you master the art of wasm through practical application.  
    [Wasm By Example](https://wasmbyexample.dev/)
    
7. **WebAssembly in Action** 🎬: This book is like a blockbuster movie for developers, blending theory with real-world examples to deepen your understanding of wasm.  
    [WebAssembly in Action Book](https://www.manning.com/books/webassembly-in-action)
    
8. **WebAssembly Awesome List** 📜: A curated list of awesome resources, libraries, and frameworks for wasm. If you're looking for inspiration or specific tools, this is the place to be.
    
    [Awesome Wasm](https://github.com/mbasso/awesome-wasm)
    
9. **Made by WebAssembly** 🥳: Want to see what projects are made with wasm? Explore a collection of wasm-powered projects on this website and marvel at the possibilities!  
    [Made with WebAssembly](https://madewithwebassembly.com)
    
10. **WebAssembly Design** ⭐️: contains documents describing the design and a high-level overview of WebAssembly. The documents and discussions in this repository are part of the [WebAssembly Community Group](https://www.w3.org/community/webassembly/).
    

%[https://github.com/WebAssembly/design] 

---

## Bonus

Here are some bonus resources, that will help you understand Wasm use cases that are for cloud-native applications, versus in the browser (and knowing the difference).

### Docker & Wasm - The Powerful Combo

Here's a brief introduction to WASM and a discussion about the latest Docker and WASM integration with the example from the docs on how you can run WASM modules using the Docker desktop:

%[https://youtu.be/9JVV2qrp080?si=wZyB-pK3DN_dvwzd] 

### Let's Learn Cloud Native WebAssembly

Get to know the Suborbital projects, choose a WASM runtime, and view a demo of the "batteries included" framework for building web servers using WebAssembly:

%[https://www.youtube.com/live/4KP5_fXlqDE?si=ktIFg2CQ4LTGTSnd] 

---

## Summary

Now that we know what the Wasm use cases are, have a recap of WasmCon, and have the top 10 list of resources to get involved and deep dive into learning, I know that you'll be prepared for Wasm Day at KubeCon 2023 NA in Chicago. I can't wait to see you there!

---

Follow Kubesimplify on [**Hashnode**](https://kubesimplify.com/), [**Twitter**](https://twitter.com/kubesimplify)**,** and [**LinkedIn**](https://www.linkedin.com/company/kubesimplify/). Join our [**Discord**](https://blog.kubesimplify.com/kubesimplify.com/discord) server to learn with us.