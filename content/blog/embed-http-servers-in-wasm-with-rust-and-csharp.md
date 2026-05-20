---
title: "Embed HTTP servers in WASM with Rust and CSharp"
datePublished: 2022-11-07T12:30:42.213Z
slug: embed-http-servers-in-wasm-with-rust-and-csharp
author: philippe-charriere
cover: /img/blog/embed-http-servers-in-wasm-with-rust-and-csharp/idgNKk_ZiC.jpeg
tags: ["csharp", "webassembly", "rust", "wasm", "wasi"]
cuid: cla6rhpt5002beinv5k8e177e
---
For a while, some WASM runtimes implement the Socket specification. So, let’s see how to code an HTTP server directly with WASM.

## Quick reminder about WASM and WASI

First, WebAssembly (WASM) is a compilation target. Initially, designed for the browser (to augment JavaScript). This binary format is optimized for the size of the produced file and speed execution.
A WASM runtime executes the WAM module (the compiled file) in an isolated sandbox (with no access to the resources of the host computer unless it’s explicitly allowed).
From a browser perspective, the WASM runtime is the JavaScript VM.

Since 2019, WebAssembly is moving outside the browser. It’s the reason why a new standard was created (the specification is a work in progress): **WASI** (WebAssembly System Interface). WASI is an API for the WASM runtimes to define how to provide access to the host resources by the WASM modules.

Now runtimes can take several forms: 
- **Applications** that can load the WASM modules as **plugins**
- **CLI applications** like [WasmEdge](https://wasmedge.org/), [WasmTime](https://wasmtime.dev/), or [Wasmer](https://wasmer.io/), (and the others).  These Command line runtimes execute a wasm module regardless of the architecture.
- **Frameworks** for building applications that can run WASM modules, like, for example, [Spin](https://developer.fermyon.com/spin/index) (from [Fermyon](https://www.fermyon.com/)), [Sat](https://github.com/suborbital/sat) (from [Suborbital](https://suborbital.dev/opensource)), [Wasm Workers Server](https://github.com/vmware-labs/wasm-workers-server) (from [Wasm Labs @ VMware OCTO](https://wasmlabs.dev/articles/run-workers-anywhere/)), and even my own project [Capsule](https://bots-garden.github.io/capsule/) using the [Wazero runtime](https://wazero.io/) which are small applications servers serving the WASM modules as nano services (or functions) through HTTP.

As I said, the WASI specification is a work in progress. Every WASM runtime implements the most advanced [WebAssembly proposal’s](https://github.com/WebAssembly/WASI/blob/main/Proposals.md).

If there is no official specification for socket networking, **WasmEdge** and **WasmTime** already implement their own POSIX sockets.

**So, what does this imply?**. It means that we can now start to embed web servers inside the WebAssembly modules! (🖐 Disclaimer! It’s not ready for production).

I will show you two examples of WASM HTTP servers. One with **WasmEdge** and **Rust**, the other with **WasmTime** and the **dotNet Core WASM** support.

## Create a WASM HTTP server with Rust and WasmEdge

The following example is inspired by this [WasmEdge project](https://github.com/WasmEdge/wasmedge_hyper_demo).

### Requirements

To use it, you need to install the Rust SDK and the WasmEdge Runtime.

**Installing the WasmEdge Runtime**:

```bash
curl -sSf https://raw.githubusercontent.com/WasmEdge/WasmEdge/master/utils/install.sh | bash -s -- -v 0.11.1
source /home/ubuntu/.wasmedge/env # the installer will give you the appropriate path)
# check
wasmedge --version
```

**Installing the Rust SDK (+ wasm support)**:

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
source "$HOME/.cargo/env"
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
rustup target add wasm32-wasi
```

### Create a Rust project

First, create an `http-service` directory with two files: `Cargo.toml` at the root of the project and `main.rs` in the `src` subdirectory:

```bash
http-service
├── Cargo.toml
├── src
│  └── main.rs
```

This is the content of the two files:

**`main.rs`**
```rust
use std::net::SocketAddr;

use hyper::server::conn::Http;
use hyper::service::service_fn;
use hyper::{Body, Method, Request, Response};
use tokio::net::TcpListener;

async fn echo(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
  match (req.method(), req.uri().path()) {

    (&Method::GET, "/") => Ok(Response::new(Body::from(
          "👋 Hello World 🌍",
    ))),


    (&Method::POST, "/hello") => {
      let name = hyper::body::to_bytes(req.into_body()).await?;
      let name_string = String::from_utf8(name.to_vec()).unwrap();

      let answer = format!("{}{}", "👋 Hello ".to_owned(), name_string);

      Ok(Response::new(Body::from(answer)))
    }

    _ => {
        Ok(Response::new(Body::from("😡 try again")))
    }
  }
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let addr = SocketAddr::from(([0, 0, 0, 0], 8080));

  let listener = TcpListener::bind(addr).await?;
  println!("Listening on http://{}", addr);
  loop {
    let (stream, _) = listener.accept().await?;

    tokio::task::spawn(async move {
        if let Err(err) = Http::new().serve_connection(stream, service_fn(echo)).await {
          println!("Error serving connection: {:?}", err);
        }
    });
  }
}
```

**`Cargo.toml`**
```toml
[package]
name = "http-service"
version = "0.1.0"
edition = "2021"

[dependencies]
hyper_wasi = { version = "0.15", features = ["full"]}
tokio_wasi = { version = "1.21", features = ["rt", "macros", "net", "time", "io-util"]}
```

### Build and Serve the WASM service

To **build** the WASM service, type the below command:
```bash
cargo build --target wasm32-wasi
# The command will produce the file: target/wasm32-wasi/debug/http-service.wasm
```
> Under Linux, if you get this error when building the project: `error: linker cc not found`, that means you need to install the build-essential package:
> ```bash
> sudo apt-get update
> sudo apt install build-essential -y
> ```

To **start** the HTTP server, type the below command:
```bash
wasmedge target/wasm32-wasi/debug/http-service.wasm
```

Then, you can test the WASM service with a `curl` command:
```bash
curl -d 'Bob Morane' -X POST http://127.0.0.1:8080/hello
```
And, you should get `👋 Hello Bob Morane`.

> The drawback is that, it seems to work with only WasmEdge; if I try with **WasmTime** (wich implements the socket networking too), I get an error:
> ```bash
> wasmtime target/wasm32-wasi/debug/http-service.wasm --tcplisten localhost:8080
> 
> Error: failed to run main module `target/wasm32-wasi/debug/http-service.wasm`
> 
> Caused by:
>    0: failed to instantiate "target/wasm32-wasi/debug/http-server.wasm"
>    1: unknown import: `wasi_snapshot_preview1::sock_setsockopt` has not been defined
> ```

### WasmEdge and Docker

At KubeCon NA 2022, Docker announced **Docker+Wasm technical preview** in partnership with WasmEdge. Docker developers can simply build and run a complete Wasm application, thanks to a **containerd shim** developed in collaboration with Docker and WasmEdge. This shim extracts the Wasm module from the OCI artifact and runs it using the WasmEdge runtime.

#### Build the image and serve the service

> You need to install the **[Docker+Wasm preview](https://docs.docker.com/desktop/wasm/)**

Create a `Dockerfile`:
```Dockerfile
FROM scratch
COPY ./target/wasm32-wasi/debug/http-service.wasm /http-service.wasm
EXPOSE 8080
ENTRYPOINT [ "http-service.wasm" ]
```

Type the below command:
```bash
docker buildx build --platform wasi/wasm32 -t wasmservice .
```
> The size image of the image is under 9MB.


To run the service with Docker, type the below command:
```bash
docker run -dp 8080:8080 --name=wasmservice --runtime=io.containerd.wasmedge.v1 --platform=wasi/wasm32 wasmservice
```
> You can choose the runtime with the `--runtime` option, but right now, the option exits only for the WasmEdge runtime.

And now you can call the service like this: `curl -d 'Bob Morane' -X POST http://127.0.0.1:8080/hello`, and of course you'll get `👋 Hello Bob Morane`.

I said that **WasmTime** implements the socket API, so let’s see how to use it with the WASM support of the dotNet framework.

## Create a WASM HTTP server with ASP.Net, CSharp and WasmTime

> I didn’t find clear and understandable (for me) documentation about the socket support with WasmTime, but the [Mio project](https://github.com/tokio-rs/mio) provides an example of a [WASM TCP server](https://github.com/tokio-rs/mio/blob/master/examples/tcp_listenfd_server.rs) runnable with WasmTime. 

However, when I was at WasmDay at Kubecon Valencia in May 2022, I attended to an awesome presentation by [Steve Sanderson](https://twitter.com/stevensanderson) from Microsoft: ["Bringing WebAssembly to the .NET Mainstream"](https://www.youtube.com/watch?v=PIeYw7kJUIg). Steve was running an **embedded ASP.Net HTTP server in a wasm module with WasmTime**. 

So, let’s try to reproduce this experiment.

### Requirements

**Installing the WasmTime Runtime**:

```bash
curl https://wasmtime.dev/install.sh -sSf | bash
# check
wasmtime --version
```

**Installing the dotNet Core Preview SDK (+ wasm support)**:

```bash
wget https://download.visualstudio.microsoft.com/download/pr/f5c74056-330b-452b-915e-d98fda75024e/18076ca3b89cd362162bbd0cbf9b2ca5/dotnet-sdk-7.0.100-rc.2.22477.23-linux-x64.tar.gz
mkdir -p $HOME/dotnet && tar zxf dotnet-sdk-7.0.100-rc.2.22477.23-linux-x64.tar.gz -C $HOME/dotnet
rm dotnet-sdk-7.0.100-rc.2.22477.23-linux-x64.tar.gz

export DOTNET_ROOT=$HOME/dotnet
export PATH=$PATH:$HOME/dotnet
dotnet workload install wasm-tools
```
> To get the last version of the dotNet Core Preview SDK, visit this page [https://dotnet.microsoft.com/en-us/download/dotnet/7.0](https://dotnet.microsoft.com/en-us/download/dotnet/7.0)

### Create an ASP.Net project

The below commands will generate an ASP.Net project and add the WASI support to the project:
```bash
dotnet new web -o hello
cd hello
dotnet add package Wasi.Sdk --prerelease
dotnet add package Wasi.AspNetCore.Server.Native --prerelease
```

### Change the code of `Program.cs`

Change the code of `hello/Program.cs` by the following one:
```csharp
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args).UseWasiConnectionListener();

var app = builder.Build();

app.MapGet("/", () => {
  return $"👋 Hello, World! 🌍 🖥️: {RuntimeInformation.OSArchitecture} ⏳: {DateTime.UtcNow.ToLongTimeString()} (UTC)";
});

app.Run();
```

### Build and serve the service

Type the below commands to build the service:
```bash
cd hello
dotnet build
```

Start the service with the below commands:
```bash
cd hello
wasmtime bin/Debug/net7.0/hello.wasm --tcplisten localhost:8080
```

Call the service: `curl http://localhost:8080` and you'll get something like this: `👋 Hello, World! 🌍 🖥️: Wasm ⏳: 14:09:12 (UTC)`. My only regret is that does not yet run with the Docker+Wasm preview.

> I tried with WasmEdge: `wasmedge bin/Debug/net7.0/hello.wasm`, but unsurprisingly it didn't work:
> ```bash
> [2022-11-06 14:11:54.358] [error] instantiation failed: incompatible import type, Code: 0x61
> [2022-11-06 14:11:54.358] [error]     Mismatched function type. Expected: FuncType {params{i32 , i32 , i32} returns{i32}} , Got: FuncType {params{i32 , i32} returns{i32}}
> [2022-11-06 14:11:54.358] [error]     When linking module: "wasi_snapshot_preview1" , function name: "sock_accept"
> [2022-11-06 14:11:54.358] [error]     At AST node: import description
> [2022-11-06 14:11:54.358] [error]     At AST node: import section
> [2022-11-06 14:11:54.358] [error]     At AST node: module
> ```
> But, it should work: [https://twitter.com/juntao/status/1589323762901843971?s=20&t=fvjV0JSBXZgn0Px5f22IlA](https://twitter.com/juntao/status/1589323762901843971?s=20&t=fvjV0JSBXZgn0Px5f22IlA) - stay tuned, I created an [issue](https://github.com/WasmEdge/WasmEdge/issues/2056) at the WasmEdge project.

It's only a start, but the WASI specification seems to be moving in the right direction (even if the implementations sometimes diverge). It is already possible to offer "nano services" with no dependency other than the runtime. And I find dotNet Core's WASI support particularly impressive (and even more ASP.Net).

> You can find the source code of the examples at [https://github.com/wasm-university/wasm-hosted-web-servers](https://github.com/wasm-university/wasm-hosted-web-servers). This is a [Gitpod](https://www.gitpod.io/), so you can test the samples without installing anything. Open this URL with your browser: [https://gitpod.io/#https://github.com/wasm-university/wasm-hosted-web-servers](https://gitpod.io/#https://github.com/wasm-university/wasm-hosted-web-servers).


Follow Kubesimplify on [Hashnode](https://kubesimplify.com/), [Twitter](https://twitter.com/kubesimplify) and [Linkedin](https://www.linkedin.com/company/kubesimplify/). Join our [Discord](kubesimplify.com/discord) server to learn with us.

