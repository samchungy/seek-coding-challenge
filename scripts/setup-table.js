const fs = require('fs').promises;
const path = require('path');
const AWS = require('aws-sdk');
const config = require('./config');

const createTable = async () => {
  const db = new AWS.DynamoDB(config.dynamodb.connection);
  const TableName = config.dynamodb.tableName;
  await db.createTable({...config.dynamodb.schema, TableName}).promise();
  await db.updateTimeToLive({TableName, TimeToLiveSpecification: config.dynamodb.ttl}).promise();
};

const seedTable = async () => {
  const client = new AWS.DynamoDB.DocumentClient(config.dynamodb.connection);

  const batchWriteObjects = async (objects) => {
    const writeObjects = async (index = 0, unprocessedItems) => {
      if (index >= objects.length) {
        return;
      }

      const params = {
        RequestItems: unprocessedItems || {
          // Grab max 25 items from our list
          [config.dynamodb.tableName]: objects
              .slice(index, index + config.dynamodb.batchMaxWrites)
              .map((i) => ({PutRequest: {Item: i}})),
        },
      };

      return await client
          .batchWrite(params)
          .promise()
          .then(({UnprocessedItems}) => {
            if (UnprocessedItems && Object.keys(UnprocessedItems).length !== 0) {
            // Finish processing this batch.
              return writeObjects(index, UnprocessedItems);
            } else {
            // Write the next lot
              return writeObjects(index + config.dynamodb.batchMaxWrites);
            }
          });
    };

    return await writeObjects().catch((err) => {
      console.error(err, 'Failed to batch write');
      throw err;
    });
  };

  const getAllFileData = async () => {
    const dir = config.dataDirectory;
    const dirRel = config.dataDirectoryRelative;
    const files = await fs.readdir(dir);
    return files.flatMap((name) => require('./' + path.join(dirRel, name)));
  };

  const data = await getAllFileData();
  await batchWriteObjects(data);
};


createTable().then(seedTable).catch((err) => {
  console.error(err, 'Failed to create Dynamodb table');
  process.exit(1);
});
