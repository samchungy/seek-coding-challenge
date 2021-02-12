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
        {
          AttributeName: 'name',
          AttributeType: 'S',
        },
        {
          AttributeName: 'discountGroup',
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
          IndexName: 'name',
          KeySchema: [
            {
              AttributeName: 'name',
              KeyType: 'HASH',
            },
          ],
          Projection: {
            ProjectionType: 'KEYS_ONLY',
          },
        },
        {
          IndexName: 'discountGroup',
          KeySchema: [
            {
              AttributeName: 'discountGroup',
              KeyType: 'HASH',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
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
