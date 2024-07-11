import { Fn, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const importBucket = new Bucket(this, 'importBucket', {
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [HttpMethods.PUT, HttpMethods.POST],
          allowedOrigins: [
            'http://localhost:3000',
            'https://d3bxh5egtazrmo.cloudfront.net',
          ],
        },
      ],
    });

    const importProductsFileLambda = new NodejsFunction(
      this,
      'importProductsFileLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        functionName: 'importProductsFile',
        handler: 'handler',
        entry: join(__dirname, '../', 'lambdas', 'importProductsFile.ts'),
        environment: {
          BUCKET_NAME: importBucket.bucketName,
        },
      }
    );

    importBucket.grantReadWrite(importProductsFileLambda);

    const catalogItemsQueueUrl = Fn.importValue('catalogItemsQueueUrl');
    const catalogItemsQueueArn = Fn.importValue('catalogItemsQueueArn');

    const importFileParserLambda = new NodejsFunction(
      this,
      'importFileParserLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        functionName: 'importFileParser',
        handler: 'handler',
        entry: join(__dirname, '../', 'lambdas', 'importFileParser.ts'),
        environment: {
          BUCKET_NAME: importBucket.bucketName,
          QUEUE_URL: catalogItemsQueueUrl,
        },
        bundling: {
          minify: true,
          sourceMap: true,
          sourceMapMode: SourceMapMode.INLINE,
          sourcesContent: false,
          nodeModules: ['csv-parser'],
        },
      }
    );

    importFileParserLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['sqs:SendMessage'],
        resources: [catalogItemsQueueArn],
      })
    );

    importBucket.grantReadWrite(importFileParserLambda);
    importBucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new LambdaDestination(importFileParserLambda),
      {
        prefix: 'uploaded/',
      }
    );

    const api = new RestApi(this, 'ImportApi', {
      restApiName: 'ImportApi',
    });

    const importResource = api.root.addResource('import');

    importResource.addMethod(
      'GET',
      new LambdaIntegration(importProductsFileLambda)
    );
  }
}
