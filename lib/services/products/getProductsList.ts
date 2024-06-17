import { APIGatewayProxyEvent } from 'aws-lambda';
import { PRODUCTS } from '../data/mock-products-data';
import { headers } from '../configs/headers.config';

const handler = async (event: APIGatewayProxyEvent) => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify([...PRODUCTS.values()]),
  };
};

export { handler };
