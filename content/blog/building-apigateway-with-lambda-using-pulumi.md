---
title: "Building APIGateway with Lambda using Pulumi"
seoTitle: "Building APIGateway with Lambda using Pulumi"
seoDescription: "In this post, I will guide you through creating an API Gateway with Lambda using Pulumi. I will also explain some of Pulumi's functionalities along the way."
datePublished: 2024-08-07T16:04:05.548Z
slug: building-apigateway-with-lambda-using-pulumi
author: srinivas-karnati
cover: /img/blog/building-apigateway-with-lambda-using-pulumi/2a2bce88-dbc6-4380-be88-3848efa6f31c.png
tags: ["aws", "apis", "devops", "iac"]
cuid: clzk1hgks000f09ky77n3etz8
---
While learning about IAC frameworks, I discovered Pulumi, a great project that eliminates the need to learn a new language to code your infrastructure. With Pulumi, you can write your infrastructure using the language of your choice. Pulumi supports TypeScript, Python, Go, C#, Java, YAML, and other languages.

In this post, I will guide you through creating an API Gateway with Lambda using Pulumi. I will also explain some of Pulumi's functionalities along the way.

### Prerequisites:

Before diving into the hands-on part, make sure you meet all these prerequisites:

**AWS Account:**

* You need an AWS account to deploy and manage resources.
    
* Ensure you have AWS credentials (Access Key ID and Secret Access Key) on your machine. You can configure this using the AWS CLI or directly in the Pulumi configuration.
    

**Node.js and npm:**

* Ensure Node.js (version 14 or later) and npm are installed on your machine. You can download Node.js from [nodejs.org](http://nodejs.org).
    

**Basic Knowledge of AWS Services:**

* Familiarity with AWS Lambda and API Gateway concepts will be helpful.
    
* Basic understanding of IAM roles and permissions.
    

## **Install Pulumi:**

[Pulumi](https://www.pulumi.com/) is very simple to install and all it needs a single needs is the execution of a single command (if you are in linux):

```yaml
curl -fsSL https://get.pulumi.com | sh
```

## Create your Pulumi project**:**

Once you have installed Pulumi, you can create a Pulumi project by running `pulumi new` command, it will prompt options to choose from "Template" or "AI" If you use the "AI" option, you just need to prompt your requirement and Pulumi will provide you with the necessary code that is required for you and you have to build upon the provided skeleton.

```bash
pulumi new
```

```bash
# Output 
Would you like to create a project from a template or using a Pulumi AI prompt?  [Use arrows to move, type to filter]
> template - Create a new Pulumi project using a template
  ai - Create a new Pulumi project using Pulumi AI
```

For this post, I will be using the "template" option, which will ask to select a template from the list and will be using the "aws-native-typescript" option. It is also followed by some prompts, you need to configure them as per your needs.

Once the setup is done, you will see that there are some new files and folders added such as `node_modules`, `index.ts`,`pulumi.yaml` etc.

Among the files created, `index.js` is where we will be spending most of our time. This is where you write your infrastructure code.

## **Your First S3 Bucket using Pulumi:**

Though this is out of scope for this post, I feel S3 is the simplest resource that you can create in an AWS environment.

Before writing the code for S3, first, you need to import some npm packages that will be going to use. Run the following to install the Pulumi AWS package.

```bash
npm install @pulumi/aws
```

Once the package is installed, you can use it inside `index.ts`. Here is the complete code you need to create an S3 Bucket using Pulumi.

```javascript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const myS3Bucket = new aws.s3.Bucket("my-test-s3");

export const s3bucketName = myS3Bucket.bucket
```

To view the preview of resources that the going to be created, you can use `pulumi preview` the command.

To create the resources, use `pulumi up`. You will prompted to confirm the action, if you are okay with the creation of resources with the shown details, confirm `yes`.

```bash
pulumi up
```

```bash
# Output
Previewing update (dev)
View in Browser (Ctrl+O): https://app.pulumi.com/karnatisrinivas/srini/dev/previews/8ed4358d-f529-4417-a512-6c747a471f80
     Type                 Name        Plan       
 +   pulumi:pulumi:Stack  srini-dev   create     
 +   └─ aws:s3:Bucket     my-test-s3  create     

Outputs:
    s3bucketName: "my-test-s3-1d51318"
Resources:
    + 2 to create

Do you want to perform this update?
```

See how simple it is to create a resource using Pulumi without needing to learn a new language.

## **Building an API with AWS APIGateway and Lambda:**

To keep this post focused on Pulumi, I won't go into the details of why we need an API or how to create one with API Gateway and Lambda.

However, I don't want to leave you in the dark. If you are unsure about how to create one, I highly recommend reading the following blog by freeCodeCamp to understand how to work with API Gateway and Lambda. Once you read it, come back here, and we will write all those steps in code. Sounds fun, right?

%[https://www.freecodecamp.org/news/building-an-api-with-lambdas-and-api-gateway-11254e23b703/] 

### Step 1: Lambda Function:

Following is the code for our lambda function which `GET` requests to the `/status` , responding with a message indicating the `service is operational`.

```javascript
exports.lambdaHandler = async (event, context) => {
    let response;

    try {
        const path = event.path;
        const method = event.httpMethod;

        if (method === 'GET' && path === '/status') {
            response = buildResponse(200, { message: 'Service is operational' });
        } else {
            response = buildResponse(404, { message: '404 Not Found' });
        }
    } catch (error) {
        console.error('Error: ', error);
        response = buildResponse(500, { message: 'Internal Server Error' });
    }

    return response;
};

const buildResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};
```

### **Step 2: Writing your infrastructure code:**

To create an API Gateway with Lambda, we need to set up the following resources in our infrastructure.

* Lambda function
    
* Lambda execution role
    
* APIGateway
    
* APIGateway Resource
    
* APIGateway Method
    
* APIGateway Deployment
    

Apart from these, we also need to create an Integration for API Gateway so that it can execute the Lambda function. Additionally, we need an invoke permission for the Lambda function to be invoked by the API Gateway.

### Step 3: Lambda function block:

The following code creates an IAM role called `lambdaRole` with permissions for AWS Lambda to use it. It then creates a Lambda function `myLambdaFunction` using Node.js 16.x, with code from `lambda/index.js` with the role `lambdaRole`.

```javascript
const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: pulumi.output({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "lambda.amazonaws.com",
                },
            },
        ],
    }).apply(JSON.stringify),
});

const lambdaFunction = new aws.lambda.Function("myLambdaFunction", {
    name: "srini-test",
    runtime: aws.lambda.Runtime.NodeJS16dX,
    code: new pulumi.asset.AssetArchive({
        "index.js": new pulumi.asset.FileAsset(path.join(__dirname, "lambda/index.js")), // Path to the compiled JavaScript code
    }),
    handler: "index.lambdaHandler",
    role: lambdaRole.arn,
});
```

### **Step 4: APIGateway:**

The following code creates an API gateway for REST API with the name `srini-test`.

```javascript
const testApiGateway = new aws.apigateway.RestApi("srini-test", {
    name: "srini-test"
})
```

### Step 5: APIGateway resource and method:

The following code creates an API Gateway resource with the path `/status` under the specified API Gateway (`testApiGateway`). It also creates a method `statusMethod`, which defines a GET method for the `/status` resource.

```java
const resource = new aws.apigateway.Resource("status",{
    restApi: testApiGateway.id,
    parentId: testApiGateway.rootResourceId,
    pathPart: "status"
})


const statusMetod = new aws.apigateway.Method("getStatus", {
    restApi: testApiGateway.id,
    resourceId:  resource.id,
    httpMethod: "GET",
    authorization: "NONE"
})
```

### Step 6: APIGateway Integration with Lambda:

This code block creates an integration for APIGateway to invoke the lambda function that we specified earlier.

```javascript

const statusIntegration = new aws.apigateway.Integration("statusIntegration",{
    restApi: testApiGateway.id,
    resourceId:  resource.id,
    httpMethod: statusMetod.httpMethod,
    type: "AWS_PROXY",
    uri: lambdaFunction.invokeArn,
    integrationHttpMethod: "POST" 
})
```

### **Step 7: APIGateway Deployment:**

After creating your API, you must deploy it to make it callable by your users. This step creates an API deployment and associates it with a stage `dev`.

The `dependsOn` block is used to make sure that deployment is created after the method and integration are created.

```javascript
const statusDeployment = new aws.apigateway.Deployment("statusDeployment", {
    restApi: testApiGateway.id,
    stageName: "dev"
}, { dependsOn: [statusMetod,statusIntegration]})
```

Now we have mentioned all the resource details that are needed for building APIGateway with Lambda endpoint. Let's try to create all the resources using `pulumi up`.

```typescript
pulumi up
```

```bash
## Output

     Type                             Name                        Status              
     pulumi:pulumi:Stack              srini-dev                                       
 +   ├─ aws:apigateway:RestApi        srini-test                  created (1s)        
 +   ├─ aws:iam:RolePolicyAttachment  lambdaRolePolicyAttachment  created (2s)        
 +   ├─ aws:lambda:Function           myLambdaFunction            created (6s)        
 +   ├─ aws:apigateway:Resource       status                      created (0.84s)     
 +   ├─ aws:apigateway:Method         getStatus                   created (0.47s)     
 +   ├─ aws:apigateway:Integration    statusIntegration           created (0.52s)     
 +   └─ aws:apigateway:Deployment     statusDeployment            created (0.74s)     

Outputs:
  + apiUrl    : "https://kssws7ccpl.execute-api.ap-south-2.amazonaws.com/dev/status"
  + lambdaArn : "arn:aws:lambda:ap-south-2:242564025624:function:srini-test"
  + lambdaName: "srini-test"
```

All the resources are created. Let's try to access the API Gateway using the URL [`https://kssws7ccpl.execute-api.ap-south-2.amazonaws.com/dev/status`](https://kssws7ccpl.execute-api.ap-south-2.amazonaws.com/dev/status) provided in the output.

![](/img/blog/building-apigateway-with-lambda-using-pulumi/b4b6b832-708a-46c8-abc3-1d9ddb8e7e24.png align="center")

According to the lambda code we provided, `/status` should return `Service is operational`. But it is returning an "Internal server error," which means we missed something in the configuration. What could it be?

%[https://media.giphy.com/media/a5viI92PAF89q/giphy.gif?cid=790b7611t8vcle18qbfzl1jha03deox3qt4cz4qgx7v5j1us&ep=v1_gifs_search&rid=giphy.gif&ct=g] 

You guessed it right! We haven't given the API Gateway permission to invoke the lambda. Let's add the required permissions using the following:

```javascript
const invokePermissions = new aws.lambda.Permission("invokePermission", {
    action: "lambda:InvokeFunction",
    function: lambdaFunction.arn,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${testApiGateway.executionArn}/*/*/*`
})
```

The above code with provide the required invoke permission for the API gateway.

Now let's try to run `pulumi up` again to create this permission. This time, Pulumi will not recreate all resources. It will only create the newly added resources or replace the ones that have changed.

```typescript
pulumi up
```

```bash
## Output
 
    Type                      Name              Status              
     pulumi:pulumi:Stack       srini-dev                             
 +   └─ aws:lambda:Permission  invokePermission  created (0.59s)     

Outputs:
    apiUrl    : "https://kssws7ccpl.execute-api.ap-south-2.amazonaws.com/dev/status"
    lambdaArn : "arn:aws:lambda:ap-south-2:242564025624:function:srini-test"
    lambdaName: "srini-test"

Resources:
    + 1 created
    9 unchanged

Duration: 4s
```

Let's try to access the API Gateway endpoint. This time, it should invoke our Lambda function and return the expected result.

![](/img/blog/building-apigateway-with-lambda-using-pulumi/33c0a891-ce34-45ee-8c40-bd7b891f8e8a.png align="center")

Yay 🥳, we got our expected result, which means our API is working.

Thanks for reading to the end. This is it for this post. I hope you learned something about creating infrastructure using Pulumi. If you want the full code mentioned in this post, you can find it here: [https://github.com/karnatisrinivas/pulumi-aws](https://github.com/karnatisrinivas/pulumi-aws).

Also, do not forget to delete your resources using `pulumi destroy`. See you again in the next post.

## Resources:

* [How to build an API with Lambdas and API Gateway](https://www.freecodecamp.org/news/building-an-api-with-lambdas-and-api-gateway-11254e23b703/)
    
* [Pulumi Crash Course](https://www.youtube.com/watch?v=1OtfZhJwvYI&list=PLGNdWBFrIUJc2vqu7kaBpZZHppzqScYPp) by CloudSpeak
    
* [Pulumi Workshop](https://pulumi.awsworkshop.io/) by AWS
    

## Conclusion:

In this guide, we explored how to use Pulumi to set up and manage AWS infrastructure with familiar programming languages. We began by installing Pulumi, creating a new project, and setting it up with templates. We demonstrated how easy it is to create an S3 bucket and other AWS resources using Pulumi. We also set up an API Gateway with Lambda, writing all the infrastructure code in TypeScript. This guide demonstrated how Pulumi simplifies infrastructure as code, making your infrastructure creation much easier and more efficient.