import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as awsNative from "@pulumi/aws-native";

const repo = new awsx.ecr.Repository("repo");

const image = new awsx.ecr.Image("app-image", {
    repositoryUrl: repo.url,
    path: "./app"
});

const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.EcsTasksPrincipal), // might be aws.iam.Principals.EcsPrincipal
    managedPolicyArns: [aws.iam.ManagedPolicy.AmazonECSTaskExecutionRolePolicy]
});

const appTaskDefinitionWithEnvVar = new awsNative.ecs.TaskDefinition("appTd", {
    family: "app-demo",
    cpu: "256",
    memory: "512",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: role.arn,
    taskRoleArn: role.arn,
    containerDefinitions: [{
        name: "app",
        image: image.imageUri,
        portMappings: [{
            containerPort: 3000,
            protocol: "tcp",
            name: "native-app-port"
        }]
    }]
});