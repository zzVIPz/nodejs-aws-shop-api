import { APIGatewayProxyEvent } from 'aws-lambda';
import * as AWS from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { headers } from '../configs/headers.config';

const dbClient = new AWS.DynamoDB();
const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

const handler = async (event: APIGatewayProxyEvent) => {
  const productId = event?.pathParameters?.productId ?? '';

  const { Item: productData } = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.productsTableName,
      Key: {
        id: productId,
      },
    })
  );

  const { Item: stockData } = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.stocksTableName,
      Key: {
        product_id: productId,
      },
    })
  );

  if (!productData) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        message: `Product with ID ${productId} does not not exist`,
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ...productData, count: stockData?.count ?? 0 }),
  };
};

export { handler };
