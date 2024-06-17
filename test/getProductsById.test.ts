import { handler as getProductsById } from '../lib/services/products/getProductsById';
import { PRODUCTS } from '../lib/services/data/mock-products-data';
import { mockedEvent } from './mock';

describe('getProductsById', () => {
  const mockedProductId = {
    ...mockedEvent,
    pathParameters: { productId: '1' },
  };

  test('should return response 404', async () => {
    const response = await getProductsById(mockedEvent);

    expect(response.statusCode).toBe(404);
  });

  test('should return response 200', async () => {
    const response = await getProductsById(mockedProductId);

    expect(response.statusCode).toBe(200);
  });

  test('should return product by ID', async () => {
    const response = await getProductsById(mockedProductId);
    const result = JSON.parse(response.body);

    expect(result).toStrictEqual(PRODUCTS.get('1'));
  });
});
