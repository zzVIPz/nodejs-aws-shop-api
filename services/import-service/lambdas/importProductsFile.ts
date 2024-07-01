import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { headers } from '../configs/headers.config';

const s3Client = new S3Client();

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  console.log('ImportProductsFile event: ', JSON.stringify(event, null, 2));
  const bucketName = process.env.BUCKET_NAME;
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'File name is required!' }),
    };
  }

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `uploaded/${fileName}`,
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
      body: JSON.stringify({ message: 'Internal Server Error', error }),
    };
  }
};
