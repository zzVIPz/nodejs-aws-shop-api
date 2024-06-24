import { APIGatewayProxyEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { headers } from '../configs/headers.config';

const dbClient = new AWS.DynamoDB();
const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

const handler = async (event: APIGatewayProxyEvent) => {
  try {
    console.log('Create product event: ', JSON.stringify(event, null, 2));
    const id = uuidv4();

    const { count, ...product } = JSON.parse(event?.body || '{}');
    const { title, description, price } = product;

    const isTitleValid = typeof title === 'string' && title.length >= 1;
    const isDescriptionValid =
      typeof description === 'string' && description.length >= 1;
    const isPriceValid = typeof price === 'number';
    const isCountValid = typeof count === 'number' && Number.isInteger(count);

    if (
      !isTitleValid ||
      !isDescriptionValid ||
      !isPriceValid ||
      !isCountValid
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Product data is invalid' }),
      };
    }

    await ddbDocClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: process.env.productsTableName,
              Item: { id, ...product },
            },
          },
          {
            Put: {
              TableName: process.env.stocksTableName,
              Item: { product_id: id, count },
            },
          },
        ],
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Product successfully crated with ID ${id} `,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error,
      }),
    };
  }
};

export { handler };
