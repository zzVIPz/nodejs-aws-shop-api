import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export class ProductsServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // SQS
    const catalogItemsQueue = new sqs.Queue(this, 'catalogItemsQueue', {
      queueName: 'catalogItemsQueue',
      visibilityTimeout: Duration.seconds(300),
    });

    // SNS
    const createProductTopic = new Topic(this, 'createProductTopic');

    createProductTopic.addSubscription(
      new EmailSubscription(process.env.EMAIL ?? 'viperexe@mail.ru')
    );

    // export url & arn of queue
    new CfnOutput(this, 'catalogItemsQueueUrl', {
      value: catalogItemsQueue.queueUrl,
      exportName: 'catalogItemsQueueUrl',
    });

    new CfnOutput(this, 'catalogItemsQueueArn', {
      value: catalogItemsQueue.queueArn,
      exportName: 'catalogItemsQueueArn',
    });

    // Tables
    const stocksTable = Table.fromTableName(this, 'stocks-table', 'stocks');
    const productsTable = Table.fromTableName(
      this,
      'products-table',
      'products'
    );

    //Lambdas
    const getProductsListLambda = new NodejsFunction(this, 'getProductsList', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      functionName: `getProductsList`,
      timeout: Duration.seconds(3),
      entry: join(__dirname, '../', 'lambdas', 'getProductsList.ts'),
      environment: {
        productsTableName: productsTable.tableName,
        stocksTableName: stocksTable.tableName,
      },
    });

    const getProductsByIdLambda = new NodejsFunction(this, 'getProductsById', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      functionName: `getProductsById`,
      timeout: Duration.seconds(3),
      entry: join(__dirname, '../', 'lambdas', 'getProductsById.ts'),
      environment: {
        productsTableName: productsTable.tableName,
        stocksTableName: stocksTable.tableName,
      },
    });

    const createProductLambda = new NodejsFunction(this, 'createProduct', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      functionName: `createProduct`,
      timeout: Duration.seconds(3),
      entry: join(__dirname, '../', 'lambdas', 'createProduct.ts'),
      environment: {
        productsTableName: productsTable.tableName,
        stocksTableName: stocksTable.tableName,
      },
    });
    const catalogBatchProcessLambda = new NodejsFunction(
      this,
      'catalogBatchProcess',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: 'handler',
        functionName: `catalogBatchProcess`,
        timeout: Duration.seconds(3),
        entry: join(__dirname, '../', 'lambdas', 'catalogBatchProcess.ts'),
        environment: {
          productsTableName: productsTable.tableName,
          stocksTableName: stocksTable.tableName,
          createProductTopic: createProductTopic.topicArn,
        },
      }
    );

    catalogBatchProcessLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );

    //Grant Access
    productsTable.grantReadData(getProductsListLambda);
    stocksTable.grantReadData(getProductsListLambda);
    productsTable.grantReadData(getProductsByIdLambda);
    stocksTable.grantReadData(getProductsByIdLambda);
    productsTable.grantReadWriteData(createProductLambda);
    stocksTable.grantReadWriteData(createProductLambda);
    productsTable.grantReadWriteData(catalogBatchProcessLambda);
    stocksTable.grantReadWriteData(catalogBatchProcessLambda);
    createProductTopic.grantPublish(catalogBatchProcessLambda);

    //Integrations
    const getProductsListLambdaIntegration = new LambdaIntegration(
      getProductsListLambda
    );

    const getProductByIdLambdaIntegration = new LambdaIntegration(
      getProductsByIdLambda
    );

    const createProductLambdaIntegration = new LambdaIntegration(
      createProductLambda
    );

    //API Gateway
    const apiGateway = new RestApi(this, 'core-api', {
      restApiName: 'MyStore api',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });

    const productsResource = apiGateway.root.addResource('products');
    const singleProductRecourse = productsResource.addResource('{productId}');

    productsResource.addMethod('GET', getProductsListLambdaIntegration);
    productsResource.addMethod('POST', createProductLambdaIntegration);
    singleProductRecourse.addMethod('GET', getProductByIdLambdaIntegration);
  }
}
