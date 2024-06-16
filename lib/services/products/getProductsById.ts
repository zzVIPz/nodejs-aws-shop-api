import { APIGatewayProxyEvent } from 'aws-lambda';
import { PRODUCTS } from '../data/mock-products-data';

const handler = (event: APIGatewayProxyEvent) => {
  return {
    statusCode: 200,
    body: PRODUCTS,
  };
};

export { handler };
