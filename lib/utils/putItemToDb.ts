import * as AWS from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dbClient = new AWS.DynamoDB();
const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

export const putItemToDB = async (
  tableName: string | undefined,
  item: Record<string, string | number>
) => {
  const currentID = item.id ?? item.product_id;

  try {
    await ddbDocClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    console.log(
      `Product ${currentID} successfully added to table ${tableName}`
    );
  } catch (error) {
    console.error(
      `Failed to add product ${currentID} to table ${tableName}`,
      error
    );
  }
};
