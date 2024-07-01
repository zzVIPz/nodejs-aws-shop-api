import { S3Handler } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

const s3Client = new S3Client();

export const handler: S3Handler = async (event) => {
  console.log('ImportFileParser Event: ', JSON.stringify(event, null, 2));

  const bucketName = event.Records[0].s3.bucket.name;
  const fileKey = event.Records[0].s3.object.key;

  try {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: fileKey })
    );
    const stream = response.Body as Readable;
    const results: any[] = [];

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    const newFileKey = fileKey.replace('uploaded/', 'parsed/');

    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${fileKey}`,
        Key: newFileKey,
      })
    );

    await s3Client.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey })
    );
  } catch (e) {
    console.error('ImportFileParser error:', e);
  }
};
