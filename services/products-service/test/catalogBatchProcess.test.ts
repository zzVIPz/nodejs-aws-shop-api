import { handler as catalogBatchProcess } from '../lambdas/catalogBatchProcess';
import { SQSEvent } from 'aws-lambda';

jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PublishCommand: jest.fn(),
}));
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDB: jest.fn(),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
  },
  TransactWriteCommand: jest.fn(),
}));

const sqsEvent = {
  Records: [
    {
      body: JSON.stringify({
        product_id: '1',
        title: 'Product 1',
        description: 'Description 1',
        count: 10,
        price: 100,
      }),
    },
  ],
};

describe('catalogBatchProcess', () => {
  it('should handle SQS event and execute transactions and SNS publish', async () => {
    process.env.productsTableName = 'mockProductsTable';
    process.env.stocksTableName = 'mockStocksTable';
    process.env.createProductTopic = 'mockCreateProductTopic';

    await catalogBatchProcess(sqsEvent as SQSEvent);

    expect(
      require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from
    ).toHaveBeenCalledWith(expect.anything());
    expect(
      require('@aws-sdk/lib-dynamodb').TransactWriteCommand
    ).toHaveBeenCalledWith({
      TransactItems: [
        {
          Put: {
            TableName: 'mockProductsTable',
            Item: {
              id: '1',
              title: 'Product 1',
              description: 'Description 1',
              price: 100,
            },
          },
        },
        {
          Put: {
            TableName: 'mockStocksTable',
            Item: {
              product_id: '1',
              count: 10,
            },
          },
        },
      ],
    });

    expect(require('@aws-sdk/client-sns').PublishCommand).toHaveBeenCalledWith({
      TopicArn: 'mockCreateProductTopic',
      Message: 'AWS - 1 records were created',
      Subject: 'AWS SNS updates',
    });
  });
});
