import { APIGatewayProxyEvent } from 'aws-lambda';
import { headers } from '../configs/headers.config';
import { putItemToDB } from '../../utils/putItemToDb';
import { v4 as uuidv4 } from 'uuid';

const handler = async (event: APIGatewayProxyEvent) => {
  try {
    console.log('Create product event: ', JSON.stringify(event, null, 2));
    const id = uuidv4();

    const { count, ...product } = JSON.parse(event?.body || '{}');

    await putItemToDB(process.env.productsTableName, {
      id,
      ...product,
    });
    await putItemToDB(process.env.stocksTableName, { product_id: id, count });

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
      }),
    };
  }
};

export { handler };
