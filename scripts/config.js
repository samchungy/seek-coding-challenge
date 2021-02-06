module.exports = {
  dynamodb: {
    connection: {
      endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
    },
    batchMaxWrites: 25,
    tableName: process.env.AWS_DYNAMODB_TABLE,
    schema: {
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S',
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE',
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'skIndex',
          KeySchema: [
            {
              AttributeName: 'sk',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'pk',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'KEYS_ONLY',
          },
        },
      ],
    },
    ttl: {
      AttributeName: 'ttl',
      Enabled: true,
    },
  },
  dataDirectory: './scripts/data',
  dataDirectoryRelative: './data',
};
