import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NodejsAwsShopApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Lambdas
    const getProductsListLambda = new NodejsFunction(this, 'getProductsList', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      functionName: `getProductsList`,
      timeout: Duration.seconds(3),
      entry: join(__dirname, 'services', 'products', 'getProductsList.ts'),
    });

    const getProductsByIdLambda = new NodejsFunction(this, 'getProductsById', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      functionName: `getProductsById`,
      timeout: Duration.seconds(3),
      entry: join(__dirname, 'services', 'products', 'getProductsById.ts'),
    });

    //Integrations
    const getProductsListLambdaIntegration = new LambdaIntegration(
      getProductsListLambda
    );

    const getProductByIdLambdaIntegration = new LambdaIntegration(
      getProductsByIdLambda
    );

    //API Gateway
    const apiGateway = new RestApi(this, 'core-api');

    const productsResource = apiGateway.root.addResource('products');
    const singleProductRecourse = productsResource.addResource('{productId}');

    productsResource.addMethod('GET', getProductsListLambdaIntegration);
    singleProductRecourse.addMethod('GET', getProductByIdLambdaIntegration);
  }
}
