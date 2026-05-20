---
title: "Event-Driven Architecture Simplified: Monolith to Microservices"
seoTitle: "Event-Driven Architecture Simplified: Monolith to Microservices"
seoDescription: "Monolith is an ancient word that refers to a huge single block of stone. In software engineering, a monolithic architecture refers to a complete software ap"
datePublished: 2022-04-18T12:43:41.950Z
slug: event-driven-architecture-simplified-monolith-to-microservices
author: hamees-sayed
cover: /img/blog/event-driven-architecture-simplified-monolith-to-microservices/Pu6qciSGj.jpg
tags: ["microservices", "programming", "computer-science", "system-architecture", "design-and-architecture"]
cuid: cl24pkht100ljrznvf6fybmta
---
Before we dig in on Event-Driven Architecture specifically, I'd like to talk about System Design more generally and specifically the Monolithic Software Architecture.


### What is Monolithic Architecture
Monolith is an ancient word that refers to a huge single block of stone. In software engineering, a monolithic architecture refers to a complete software application in a single package.

The different components of an application merge into a single-unit software application.

Usually, a monolithic application consists of different components like database, server-side, and client-side applications all in one piece. All the application’s parts are unified and all its functions are managed in one place.

![Example-of-Monolithic-Architecture-1.png](/img/blog/event-driven-architecture-simplified-monolith-to-microservices/bS-7RqgYZ.png)

For example, consider a monolithic Travel Booking application. It might contain a web server, a database server, a catalogue service that processes hotel images, a booking system, a payment function, and an authentication service.   

As you can imagine, given their broad scope, monolithic applications tend to have huge codebases. Making a small change in a single function requires compiling and testing the entire platform, which goes against the agile approach and isn't efficient anymore.


### Introduction to Microservices   
![main.png](/img/blog/event-driven-architecture-simplified-monolith-to-microservices/zVNm0-_4w.png)
In contrast to the monolithic architecture, a microservice approach addresses these challenges by breaking the application down into smaller components or services.   
 
Each component is responsible for a single function (hence “microservice”) and communicates with other components over APIs and messaging protocols.  
 
Each development team is responsible for an individual component, and because components communicate with each other via APIs, developers don’t need to understand the complexity of other components but only the component they are working on.   

Teams can develop and deploy changes independently, and new developers have a much gentler learning curve, enabling them to be productive much sooner.



### What are Events    
![Screenshot 2022-04-09 064259.png](/img/blog/event-driven-architecture-simplified-monolith-to-microservices/qWxHhDdnn.png)
An event indicates a state change; that something has happened. This ‘something’ could be raising an issue on Github, a customer submitting a review for a received product or a customer adding a product to the cart and the like.  

Events are used to signal to interested consumers that a state change occurred. An event is a record of something that happened, so it can't be changed.  



### What is Event-Driven Architecture    
An event-driven architecture is a software design pattern in which microservices react to changes that happen, called “events”.  

Events can either carry a state (such as the price of an item or a reported issue) or events can be identifiers (a notification that an order was received or shipped, for example).   

The events trigger microservices that work together to achieve a common goal but do not have to know anything about each other except for the event details.
Although operating together, each microservice can apply different business logic and emit its own output events.   

For the event to trigger the correct response, an event-driven system follows three key components: event producers, event brokers, and event consumers. 
![What-is-an-event-broker-nordic-apis-event-mediator.png](/img/blog/event-driven-architecture-simplified-monolith-to-microservices/DEG0xbuJ6.png)   

**For Example**:   
You’re on the ground floor of a building but need to be on the 20th floor. You press the button that calls the elevator, which then travels down to meet you, opens its doors, welcomes you in, and takes you to the floor of your choice, where it opens up and lets you out.   

Pressing the button produced the event. The elevator's operational system(event broker), processed the request by sending it to the elevator car itself(event consumer), which then processed the trip from the ground floor to the 20th. Nothing at all happened until the event of pushing the button happened.  

**To have a more clear understanding let's consider an eCommerce Application**:

![Screenshot 2022-04-15 194717.png](/img/blog/event-driven-architecture-simplified-monolith-to-microservices/O1xgFOHmH.png)

**Event producer**  
A customer places an order on an eCommerce site creating a “CheckOut” event that is sent to an event broker.

**Event broker**  
Makes the event available to event consumers that subscribe to “Check Out” type events.

**Event consumers**  
Services such as “Stock” and “Communication.”  
The “Stock” service checks to see if the item is in stock. If the item is in stock, an event is created and consumed by the “Communication” service, which sends a message event letting the customer know that the order is being processed and another message will be sent when it is shipped.  

If the item is out of stock, the “Communication” service lets the consumer know that they can wait for the item to be in stock or cancel the order.  


### Event-Driven Architecture models     
Event-Driven Architecture is mainly formed upon two architecture models. 
1. Pub-Sub Model   
2. Event Streaming model.  


#### Pub-Sub Model  
![Screenshot 2022-04-10 155832.png](/img/blog/event-driven-architecture-simplified-monolith-to-microservices/BZYop6KS6.png) 
Pub-Sub, also known as Publish-Subscribe is a messaging pattern that allows different services to interact with each other asynchronously.   

In this pattern, messages are published from a producer to subscribers(consumers). The publisher publishes events to the broker. Subscribers can sign up for the type of events they are interested in.   

You can imagine this as a Youtube subscription; The content creator(publisher) publishes a specific type of video content(event) on the youtube platform(Broker). The viewer(Subscriber) can subscribe to the type of content they are interested in to receive a notification every time the video(event) is uploaded(published) on youtube(broker).
 

Let's Understand this through a real-life example: 

- The user places an order for a pizza via the **User Profile Service** (a mobile app UI). The service captures such data as the user’s name, current location, contact info, etc., and publishes the *pizza order event*.
- The **Food Delivery Service** (like Uber Eats, Zomato) subscribes to the *pizza order event* so it reacts to it by publishing the *take pizza order event*.
- The **Restaurant Partner Service**, which is subscribed to the *take pizza order event*, fulfils the order and publishes the *pizza order ready event*.
- The **Food Delivery Service** sends the allocate nearest deliveryman and schedules *delivery time events*, respectively. It can now monitor the location of the order and provide ETA (Estimated Time of Arrival) notifications for the user.  
  
  
  
#### Event-Streaming Model    

![Screenshot 2022-04-10 171311.png](/img/blog/event-driven-architecture-simplified-monolith-to-microservices/6NBLFXDws.png)

**What is event-stream**  
An event stream is a constant flow of events. Streams are continuously generated by users interacting with applications, IoT sensors that periodically send data, security-related events, etc.  

In the Event streaming model, events are registered in the broker. Unlike the Pub-Sub model, consumers don't subscribe to an event stream but they can read any event and trigger an action accordingly. 

With event stream processing you connect all event producers to consumers. You can then begin to correlate events and over time you see patterns emerge that describe events in a specific manner that could be used to make predictions and perform tasks and then you apply real-time business logic and rules or machine learning to trigger action.   

Event stream processing can make sense of vast amounts of data arriving into your business to help filter out what’s important so you can automate processes and respond to important events in real-time.

Now, visualize Youtube without the subscription model; You receive every type of video content(event) but you only watch a certain type of content that's beneficial to you and overtime the youtube platform(broker) understands your content pattern and only shows you the desired content through real-time algorithmic analysis and ML Service. (Kafka Streams could be used to perform such tasks)  

- **Use Case - IoT**  
In the context of [automating manufacturing processes](https://docs.microsoft.com/en-us/azure/stream-analytics/stream-analytics-get-started-with-azure-stream-analytics-to-process-data-from-iot-devices), companies can integrate an IoT solution by adding various sensors that transmit streams of data in event format in real-time.   

   In order to make use of the data and analyze it to identify patterns and quickly take 
   action on them, businesses would need to employ an event stream processing 
   methodology.   
   The event streaming platform would take this stream of events and run real-time 
   analytics.  

   For example, we may be interested in monitoring the average temperature of a 
   warehouse over a 30 second period. Afterwards, we want the temperature to be 
   displayed only if the temperature exceeds 45 °C. Whenever this condition is met, the 
   alert can be used by other applications to react in real-time and adjust operations to 
   avoid the risk of overheating.
 


### Benefits of Event-Driven Architecture over Traditional Architecture   
  
- **Responsiveness** ⏱️  
Since everything happens independently and at a swift rate, event-driven architecture provides the fastest possible response time.  

- **Scalability** 📈  
Since every component is independent of each other, you can add service instances to scale. Messages can be consumed and transformed extremely fast, which is advantageous for processes where millisecond decision making is necessary.  

- **Agility** 🚀  
If you want to add another service, you can just have it subscribe to an event and have it generate new events of its own. The existing services don’t know or care that this has happened, so there’s no impact on them.  

- **Versatility** 📨  
By using an event mesh you can deploy services wherever you want; cloud, on-premises, in a different country, etc. Since the event mesh learns where subscribers are, you can move services around without the other services knowing.  

- **Economical** 💵   
Event-Driven Architectures are more cost-effective. With any cloud provider - AWS, GCP, and Azure we would only pay for the resources when we use them and for the duration we use them.   

   With Event-Driven Architecture, the resources are only triggered when the event 
   occurs making it an “**on-demand**” execution.   

   But with traditional architecture, we would have the resources running but in an idle 
   state and of course, anything we run irrespective of the state it is in, we would have 
   to pay for it.  
  
  
  

ThankYou for Reading!!😄  
 
I hope this blog helped you understand what is Event-Driven Architecture.

Also, make sure to join [Kubesimplify](https://kubesimplify.com/) for more such amazing blogs!  