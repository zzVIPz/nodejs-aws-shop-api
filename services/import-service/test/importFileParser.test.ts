import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { Readable } from 'stream';
import { handler as importFileParser } from '../lambdas/importFileParser';
import { Callback, Context } from 'aws-lambda';

describe('ImportFileParser handler', () => {
  const s3Mock = mockClient(S3Client);
  const context: Context = {} as Context;
  const callback: Callback<void> = () => {};
  const mockS3Event = {
    Records: [
      {
        s3: {
          bucket: {
            name: 'test-bucket',
          },
          object: {
            key: 'uploaded/csv-test-file.csv',
          },
        },
      },
    ],
  };

  beforeEach(() => {
    s3Mock.reset();
  });

  it('should parse data successfully', async () => {
    const mockStream = new Readable();
    mockStream.push('product1,product1\ntitle1,title2');
    mockStream.push(null);

    s3Mock.on(GetObjectCommand).resolves({
      Body: mockStream as any,
    });

    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await importFileParser(mockS3Event as any, context, callback);

    expect(logSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle errors properly', async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error('Test Error'));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await importFileParser(mockS3Event as any, context, callback);

    expect(errorSpy).toHaveBeenCalledWith(
      'ImportFileParser error:',
      expect.any(Error)
    );
  });
});
