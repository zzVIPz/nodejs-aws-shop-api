export const mergeById = (
  products: Record<string, any>[],
  stocks: Record<string, any>[]
) => {
  const productsMap: Record<string, Record<string, string | number>> = {};

  products.forEach((item) => {
    productsMap[item.id] = { ...item };
  });

  stocks.forEach((item) => {
    if (productsMap[item.product_id]) {
      productsMap[item.product_id] = {
        ...productsMap[item.product_id],
        ...item,
      };
    } else {
      productsMap[item.product_id] = { ...item };
    }
  });

  return Object.values(productsMap);
};
