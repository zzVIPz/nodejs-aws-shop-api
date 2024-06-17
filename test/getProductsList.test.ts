import { handler as getProductList } from '../lib/services/products/getProductsList';
import { PRODUCTS } from '../lib/services/data/mock-products-data';
import { mockedEvent } from './mock';

describe('getProductsList', () => {
  test('should return response 200', async () => {
    const response = await getProductList(mockedEvent);

    expect(response.statusCode).toBe(200);
  });

  test('should return list of products', async () => {
    const response = await getProductList(mockedEvent);
    const result = JSON.parse(response.body);

    expect(result).toStrictEqual([...PRODUCTS.values()]);
  });
});
