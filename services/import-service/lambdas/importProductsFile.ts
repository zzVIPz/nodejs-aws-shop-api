import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { headers } from '../configs/headers.config';

const s3Client = new S3Client();

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  console.log('Event: ', JSON.stringify(event));
  const bucketName = process.env.BUCKET_NAME;
  const fileKey = event.queryStringParameters?.name;

  if (!fileKey) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'File name is required' }),
    };
  }

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `uploaded/${fileKey}`,
        ContentType: 'text/csv',
      }),
      {
        expiresIn: 3600,
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error generating signed URL', error }),
    };
  }
};
