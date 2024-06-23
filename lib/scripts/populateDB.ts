import * as AWS from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'; // ES6 import
import { PRODUCTS } from '../services/data/mock-products-data';

const dbClient = new AWS.DynamoDB();
const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

const productsTable = 'products';
const stocksTable = 'stocks';

const mockedData = Array.from(PRODUCTS.values());

const putItemToDB = async (
  tableName: string,
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

const populateDB = async () => {
  for (const { id, count, ...product } of mockedData) {
    await putItemToDB(productsTable, { id, ...product });
    await putItemToDB(stocksTable, { product_id: id, count });
  }
  console.log('Tables populated script has been finished');
};

populateDB();
