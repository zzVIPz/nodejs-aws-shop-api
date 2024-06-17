import { APIGatewayProxyEvent } from 'aws-lambda';
import { PRODUCTS } from '../data/mock-products-data';
import { headers } from '../configs/headers.config';

const handler = async (event: APIGatewayProxyEvent) => {
  const productId = event?.pathParameters?.productId ?? '';
  const productDetails = PRODUCTS.get(productId);

  if (!productDetails) {
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
    body: JSON.stringify({ data: productDetails }),
  };
};

export { handler };
