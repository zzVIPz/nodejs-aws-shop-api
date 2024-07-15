import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { join } from 'path';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizerLambda = new NodejsFunction(
      this,
      'basicAuthorizerLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        functionName: 'basicAuthorizer',
        handler: 'handler',
        entry: join(__dirname, '../', 'lambdas', 'basicAuthorizer.ts'),
        environment: {
          ...(process.env.USER_CREDENTIALS && {
            USER_CREDENTIALS: process.env.USER_CREDENTIALS,
          }),
        },
        bundling: {
          minify: true,
          sourceMap: true,
          sourceMapMode: SourceMapMode.INLINE,
          sourcesContent: false,
        },
      }
    );

    SourceMapMode;

    basicAuthorizerLambda.grantInvoke(
      new iam.ServicePrincipal('apigateway.amazonaws.com')
    );

    new cdk.CfnOutput(this, 'BasicAuthorizer', {
      value: basicAuthorizerLambda.functionArn,
      exportName: 'BasicAuthorizerFunctionArn',
    });
    new cdk.CfnOutput(this, 'BasicAuthorizerRole', {
      value: basicAuthorizerLambda.role!.roleArn,
      exportName: 'BasicAuthorizerFunctionArnRole',
    });
  }
}
