export const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string,
  statusCode: string
) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
  context: {
    statusCode,
  },
});
