const AWS = require('aws-sdk');

const dynamodb = ({config}) => {
  const client = new AWS.DynamoDB.DocumentClient(config.dynamodb.connection);
  const TableName = config.dynamodb.table;

  const getObject = async ({key}) => {
    const params = {
      TableName,
      Key: key,
    };

    const data = await client
        .get(params)
        .promise()
        .catch((err) => {
          console.error(err, `Failed to get object ${JSON.stringify(key)}`);
          throw err;
        });

    return (data && data.Item) || null;
  };

  const putObject = async ({object}) => {
    const params = {
      TableName,
      Item: object,
    };
    return await client
        .put(params)
        .promise()
        .catch((err) => {
          console.error(err, `Failed to put object ${JSON.stringify(object)}`);
          throw err;
        });
  };

  const updateObject = async ({key, updateExpression, conditionExpression, expressionAttributeNames, expressionAttributeValues}) => {
    const params = {
      TableName,
      Key: key,
      UpdateExpression: updateExpression,
      ...conditionExpression && {ConditionExpression: conditionExpression},
      ...expressionAttributeNames && {ExpressionAttributeNames: expressionAttributeNames},
      ExpressionAttributeValues: expressionAttributeValues,
    };

    return await client
        .update(params)
        .promise()
        .catch((err) => {
          console.error(err, `Failed to update object ${JSON.stringify(params)}`);
          throw err;
        });
  };

  const queryObjects = async ({projectionExpressions, keyConditionExpression, expressionAttributeNames,
    expressionAttributeValues, filterExpression, indexName}) => {
    const query = async ({exclusiveStartKey}) => {
      const params = {
        TableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ...projectionExpressions && {ProjectionExpression: projectionExpressions},
        ...indexName && {IndexName: indexName},
        ...expressionAttributeNames && {ExpressionAttributeNames: expressionAttributeNames},
        ...filterExpression && {FilterExpression: filterExpression},
        ...exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey},
      };

      const results = await client
          .query(params)
          .promise()
          .catch((err) => {
            console.error(err, `Failed to query ${JSON.stringify(params)}`);
            throw err;
          });

      if (results.LastEvaluatedKey) {
        return [...results.Items, ...(await query({exclusiveStartKey: results.LastEvaluatedKey}))];
      } else {
        return results.Items;
      }
    };

    return query({});
  };

  return {
    getObject,
    queryObjects,
    putObject,
    updateObject,
  };
};

module.exports = dynamodb;
