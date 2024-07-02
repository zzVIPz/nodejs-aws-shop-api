import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
} from 'aws-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockClient } from 'aws-sdk-client-mock';
import { headers } from '../configs/headers.config';
import { handler as importProductsFile } from '../lambdas/importProductsFile';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('ImportProductsFile handler', () => {
  const s3Mock = mockClient(S3Client);
  const context: Context = {} as Context;
  const callback: Callback<APIGatewayProxyResult> = () => {};

  beforeEach(() => {
    s3Mock.reset();
    jest.clearAllMocks();
  });

  it('should return 400 if file name is missed', async () => {
    const mockEvent = {
      queryStringParameters: {},
    } as unknown as APIGatewayProxyEvent;

    const result = await importProductsFile(mockEvent, context, callback);

    expect(result).toEqual({
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'File name is required!' }),
    });
  });

  it('should return 200 with signed url', async () => {
    const signedUrl = 'https://signed-url';
    const mockEvent = {
      queryStringParameters: {
        name: 'csv-test-file.csv',
      },
    } as unknown as APIGatewayProxyEvent;

    process.env.BUCKET_NAME = 'test-bucket';

    (getSignedUrl as jest.Mock).mockResolvedValue(signedUrl);

    const result = await importProductsFile(mockEvent, context, callback);

    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: signedUrl }),
    });
  });

  it('should return 500 if there is an error', async () => {
    const mockEvent = {
      queryStringParameters: {
        name: 'csv-test-file.csv',
      },
    } as unknown as APIGatewayProxyEvent;

    process.env.BUCKET_NAME = 'test-bucket';

    (getSignedUrl as jest.Mock).mockRejectedValue(new Error('Some error'));

    const result = await importProductsFile(mockEvent, context, callback);

    expect(result?.statusCode).toBe(500);
    expect(result?.body).toContain('Internal Server Error');
  });
});
