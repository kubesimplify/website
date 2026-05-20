---
title: "Docker MCP Catalog: Finding the Right AI Tools for Your Project"
seoTitle: "Docker MCP"
seoDescription: "This blog describes what Docker MCP is and how it"
datePublished: 2025-06-26T07:32:05.511Z
slug: docker-mcp-catalog
author: saloni-narang
cover: /img/blog/docker-mcp-catalog/dbdb9d02-71cb-42b5-b660-68290ac7d695.png
tags: ["ai", "docker", "docker-images", "docker-desktop", "llm", "mcp"]
cuid: cmcd2f66f000u02l45g9529xf
---
As large language models (LLMs) evolve from static text generators to dynamic agents capable of executing actions, there's a growing need for a standardized way to let them interact with external tooling securely. That’s where [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) steps in, a protocol designed to turn your existing APIs into AI-accessible tools. Think of MCP as the missing middleware between LLMs and the real-world functionality you’ve already built. Instead of doing the prompt hacks or building custom plugins for each model, MCP allows you to define your capabilities as structured tools that any compliant AI client can discover, invoke, and interact with safely and predictably. While the protocol is still maturing and the documentation can be opaque, the underlying value is clear: MCP turns your backend into a toolbox for AI agents. Whether you're integrating scraping APIs, financial services, or internal business logic, MCP offers a portable, reusable, and scalable pattern for AI integrations. In this blog, we’ll walk through Docker Desktop's latest MCP client-server feature and explore how you can install an MCP server and use that directly from your LLM tool.  

![](/img/blog/docker-mcp-catalog/8f4837fc-24e4-41f7-8d83-227da002418b.png align="center")

### Enter Docker!

* ![](/img/blog/docker-mcp-catalog/ec056820-0667-4c3f-9d46-775f615dea58.png align="center")
    

**Why is Docker a game-changer for AI, and specifically for MCP tools?**

[Docker](https://www.docker.com/) has already proven to be the de facto standard for creating and distributing containerized applications. Its user experience is the key reason why I and millions of other developers use Docker today. Over the years, Docker has evolved to cater to the needs of developers, and it entered the AI game too. With so many MCP servers having a set of configurations living on separate GitHub repositories and different installation methods, Docker has again changed the game on how we think and run these MCP servers and connect to MCP clients like Claude.

Now we already have MCP that solves the problem of how Agents talk with the tools. In simple terms, your LLM models are capable of connecting to your tools and performing a wider set of actions. But how simple it is? There are 100s of MCP servers out there, each having its configurations and its own GitHub repository.

Docker has introduced the [**Docker MCP Catalog and Toolkit**](https://www.docker.com/products/mcp-catalog-and-toolkit/) (currently in Beta). This is a comprehensive solution designed to streamline the developer experience for building and using MCP-compatible tools.  
We can simply go to the extensions and install the Docker MCP toolkit.  

![](/img/blog/docker-mcp-catalog/9643e08a-8d53-4f78-926b-c25aed281f7c.png align="center")

**What is the Docker MCP Catalog?**

The Docker MCP Catalog is a centralized, trusted registry that offers a curated collection of MCP-compatible tools packaged as Docker images. Integrated with Docker Hub and available directly through Docker Desktop, it simplifies the discovery, sharing, and execution of over 100 verified MCP servers from partners like Stripe, Grafana etc. By running each tool in an isolated container, the catalog addresses common issues such as environment conflicts, inconsistent platform behaviour, and complex setups, ensuring portability, security, and consistency across systems. Developers can instantly pull and run these tools using Docker CLI or Desktop, with built-in support for agent integration via the MCP Toolkit

![](/img/blog/docker-mcp-catalog/679dcf66-5fae-4e18-b998-c962d2703104.png align="center")

* **Centralized Discovery:** A dedicated place (often under the `mcp/` on Docker Hub ) to find a growing list of MCP servers. Docker has mentioned collaborations with providers like Stripe, Elastic, and Neo4j, indicating a rich ecosystem of tools.
    
* **Verified and Versioned Tools:** The catalog aims to provide access to tools from verified publishers and ensures that tools are versioned, allowing developers to rely on specific, stable releases.
    
* **Easy Distribution :** Easy pull based distribution using Docker’s infra
    

**What is the MCP Toolkit?**

The **Docker MCP Toolkit** is a powerful companion to the MCP Catalog that streamlines the setup, management, and execution of containerized MCP servers and their integration with AI agents. It eliminates the need for manual configurations by offering one-click setup, secure defaults, and built-in compatibility with popular LLM-based clients like Docker gordon, Claude Desktop, Cursor, and [Continue.dev](http://Continue.dev). Acting as both an aggregator for MCP servers and a gateway for connected clients, the toolkit enables developers to browse, configure, and launch tools directly from Docker Desktop. Security is a core focus, all mcp servers are signed and includes SBOMs for transparency. The MCP Toolkit makes it easy to discover and run tools from the catalog, connect clients like Gordon or Docker AI Agent, and build secure, agent-driven workflows with minimal overhead.

Key functionalities of the MCP Toolkit:

* **Simplified Installation:** Easily pull and run MCP tools (servers) from the catalog, often with just a few clicks or simple commands.
    
* **Secure Credential Management:** One of the major pain points in tool integration is handling authentication securely. The MCP Toolkit often includes features like OAuth-based authentication and secure storage for credentials, preventing the risky practice of hardcoding secrets.
    
* **Isolated and Secure Execution:** Leverages Docker's containerization to run tools in isolated environments, enhancing security and stability.
    
* **Client Integration:** Facilitates connecting these MCP tools/servers to various AI agent clients (e.g., popular AI models or development environments like Claude, Cursor) without needing to rewrite code for each client.
    

Together, the Docker MCP Catalog and Toolkit provide a foundational layer for developers, making it easier to find, safer to use, and more scalable to integrate external tools into their AI agent applications.  

![](/img/blog/docker-mcp-catalog/9991a34f-e936-48e2-a2a7-a3e8fd0e08b3.png align="center")

### What You Can Do with the Catalog

### Let’s see it in action:

There are four MCP Clients available in the Docker Desktop  
1\. Gordon  
2\. Claude Desktop  
3\. Cursor  
4\. Continue.dev

![](/img/blog/docker-mcp-catalog/f6216f26-39a7-4dbe-858d-5da1dbc11208.png align="center")

You can simply connect to any of these, but we are connecting to the Claude desktop. After installing, click on the Connect button on the Docker Desktop app. It automatically creates a configuration json file and puts it in the right place. When you restart Claude, you will be able to see the MCP\_Docker with tools. Here tools will be the MCP servers that you have installed from the catalog.

![](/img/blog/docker-mcp-catalog/2d3debe3-4c2c-439c-8da4-fb60c0ec1c3b.png align="center")

![](/img/blog/docker-mcp-catalog/efeb24d4-f669-46de-912c-b54547b2f414.png align="center")

Now you can install MCP servers, in this case, we have installed docker mcp server.

![](/img/blog/docker-mcp-catalog/d6d5c2f2-bbba-4624-8c73-9799cfd04f4c.png align="center")

Once this is enabled, you can go to Claude and simply use human language, which would be able to interact with the tools. Here you can see 1 tool, and that tool will be listed as part of Claude desktop too.

Then let’s perform a simple task of creating an nginx container with the help of the Claude desktop:

![](/img/blog/docker-mcp-catalog/52b0ee5c-bd0e-4b38-a478-0339fcda8296.png align="center")

As soon as you run the command, it pops up a dialog box to ask permission for using the external integration, that is Docker in this case.

![](/img/blog/docker-mcp-catalog/c3ede2d0-f4da-4b61-a6f2-1caba584b859.png align="center")

So we can see below that the nginx container has been created with the ID 6d87626dcad5.

![](/img/blog/docker-mcp-catalog/b060ae2a-96cd-49de-9731-10ef8d1d2219.png align="center")

## Conclusion

Docker has always believed in streamlining the developer workflow; they have been a one-stop solution for packaging applications as Images and then running them as containers with ease. They also let you build and push WASM artifacts, and now with the AI wave, they are simplifying the whole AI ecosystem, keeping the same developer experience and fluid UI. In the future, we will build an MCP server too and then see how that works, till then let me know your favourite MCP server and what you think about Docker MCP catalog and toolkit!