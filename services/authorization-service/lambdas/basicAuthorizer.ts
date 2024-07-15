import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import { generatePolicy } from '../utils/generatePolicy';

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  console.log('Event: ', JSON.stringify(event, null, 2));

  try {
    if (!event.authorizationToken) {
      console.error('Missing authorization token');
      return generatePolicy('user', 'Deny', event.methodArn, '401');
    }

    const authorizationToken = event.authorizationToken.split(' ')[1];
    const [username, password] = Buffer.from(authorizationToken, 'base64')
      .toString('utf-8')
      .split(':');

    const envUserCredentials = process.env.USER_CREDENTIALS;

    console.log('username:', username);
    console.log('password:', password);
    console.log('envUserCredentials:', envUserCredentials);

    if (`${username}:${password}` === envUserCredentials) {
      console.log('Allow authorization');
      return generatePolicy(username, 'Allow', event.methodArn, '200');
    } else {
      console.error('Deny authorization');
      return generatePolicy(username, 'Deny', event.methodArn, '403');
    }
  } catch (e) {
    console.error('BasicAuthorizer error:', e);
    throw new Error('Unauthorized');
  }
};
