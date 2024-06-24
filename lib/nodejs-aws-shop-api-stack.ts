import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export class NodejsAwsShopApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
      entry: join(__dirname, 'services', 'products', 'getProductsList.ts'),
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
      entry: join(__dirname, 'services', 'products', 'getProductsById.ts'),
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
      entry: join(__dirname, 'services', 'products', 'createProduct.ts'),
      environment: {
        productsTableName: productsTable.tableName,
        stocksTableName: stocksTable.tableName,
      },
    });

    //Grant Access
    productsTable.grantReadData(getProductsListLambda);
    stocksTable.grantReadData(getProductsListLambda);
    productsTable.grantReadData(getProductsByIdLambda);
    stocksTable.grantReadData(getProductsByIdLambda);
    productsTable.grantReadWriteData(createProductLambda);
    stocksTable.grantReadWriteData(createProductLambda);

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
