import { APIGatewayProxyEvent } from 'aws-lambda';
import * as AWS from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { headers } from '../configs/headers.config';
import { mergeById } from '../../utils/mergeByID';

const dbClient = new AWS.DynamoDB();
const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

const handler = async (event: APIGatewayProxyEvent) => {
  const { Items: productsData = [] } = await ddbDocClient.send(
    new ScanCommand({
      TableName: process.env.productsTableName,
    })
  );

  const { Items: stockData = [] } = await ddbDocClient.send(
    new ScanCommand({
      TableName: process.env.stocksTableName,
    })
  );
  const productsList = mergeById(productsData, stockData);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(productsList),
  };
};

export { handler };
