import { SQSEvent } from 'aws-lambda';
import * as AWS from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const dbClient = new AWS.DynamoDB();
const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

const handler = async (event: SQSEvent) => {
  try {
    console.log('catalogBatchProcess event', JSON.stringify(event, null, 2));

    await Promise.all(
      event.Records.map(async (record) => {
        console.log('SQS record', JSON.stringify(record, null, 2));

        const body = JSON.parse(record.body);
        const { product_id, title, description, count, price } = body;

        await ddbDocClient.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Put: {
                  TableName: process.env.productsTableName,
                  Item: { id: product_id, title, description, price },
                },
              },
              {
                Put: {
                  TableName: process.env.stocksTableName,
                  Item: { product_id, count },
                },
              },
            ],
          })
        );
      })
    );
  } catch (error) {
    console.log('catalogBatchProcess error event', error);
  }
};

export { handler };
