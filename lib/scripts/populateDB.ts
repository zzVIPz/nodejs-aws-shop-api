import { PRODUCTS } from '../services/data/mock-products-data';
import { productsTable, stocksTable } from '../services/const';
import { putItemToDB } from '../utils/putItemToDb';

const mockedData = Array.from(PRODUCTS.values());

export const populateDB = async () => {
  for (const { id, count, ...product } of mockedData) {
    await putItemToDB(productsTable, { id, ...product });
    await putItemToDB(stocksTable, { product_id: id, count });
  }
  console.log('Tables populated script has been finished');
};

populateDB();
