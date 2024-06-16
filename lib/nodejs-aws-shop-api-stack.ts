import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NodejsAwsShopApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const getProductsListLambda = new NodejsFunction(this, 'getProductsList', {
      runtime: Runtime.NODEJS_LATEST,
      handler: 'handler',
      functionName: `getProductsList`,
      timeout: Duration.seconds(3),
      entry: join(__dirname, 'services', 'products', 'getProductsList.ts'),
    });

    const getProductsByIdLambda = new NodejsFunction(this, 'getProductsById', {
      runtime: Runtime.NODEJS_LATEST,
      handler: 'handler',
      functionName: `getProductsById`,
      timeout: Duration.seconds(3),
      entry: join(__dirname, 'services', 'products', 'getProductsById.ts'),
    });
  }
}
