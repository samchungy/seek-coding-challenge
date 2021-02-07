const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const sinon = require('sinon');
const mock = require('mock-require');

chai.use(chaiPromimsed);
chai.should();

describe('Dynamodb Common', () => {
  const errorSpy = sinon.stub(console, 'error');
  const sandbox = sinon.createSandbox();
  const putStub = sandbox.stub();
  const getStub = sandbox.stub();
  const updateStub = sandbox.stub();
  const queryStub = sandbox.stub();

  const documentStub = {
    put: sandbox.spy(() => ({promise: putStub})),
    get: sandbox.spy(() => ({promise: getStub})),
    update: sandbox.spy(() => ({promise: updateStub})),
    query: sandbox.spy(() => ({promise: queryStub})),
  };
  const awsStub = {
    DynamoDB: {
      DocumentClient: function() {
        return documentStub;
      },
    },
  };
  mock('aws-sdk', awsStub);

  const config = {
    dynamodb: {
      connection: 'url',
      table: 'table',
    },
  };
  const common = require('../src/dal/dynamodb/common')({config});

  beforeEach(() => {
    sandbox.reset();
    errorSpy.resetHistory();
  });

  describe('getObject', () => {
    it('should successfully get a non-existant object from Dynamodb', async () => {
      const key = {pk: 'testpk', sk: 'testsk'};
      getStub.resolves({});

      await common.getObject({key}).should.become(null);
    });

    it('should successfully get a object from Dynamodb', async () => {
      const key = {pk: 'testpk', sk: 'testsk'};
      const item = {pk: 'testpk', sk: 'testsk', item: 'test'};
      getStub.resolves({Item: item});

      await common.getObject({key}).should.become(item);
    });

    it('should handle errors from Dynamodb', async () => {
      const key = {pk: 'testpk', sk: 'testsk'};
      const error = new Error('bad');
      getStub.rejects(error);

      await common.getObject({key}).should.be.rejectedWith(error);
      sinon.assert.calledOnce(errorSpy);
    });
  });

  describe('putObject', () => {
    it('should successfully put an object into Dynamodb', async () => {
      const object = {pk: 'testpk', sk: 'testsk'};
      putStub.resolves({});

      await common.putObject({object}).should.be.fulfilled;
    });

    it('should handle errors from Dynamodb', async () => {
      const object = {pk: 'testpk', sk: 'testsk'};
      const error = new Error('bad');
      putStub.rejects(error);

      await common.putObject({object}).should.be.rejectedWith(error);
      sinon.assert.calledOnce(errorSpy);
    });
  });

  describe('updateObject', () => {
    it('should successfully update an object in Dynamodb with all parameters', async () => {
      const params = {
        key: 'a',
        updateExpression: 'b',
        conditionExpression: 'c',
        expressionAttributeNames: 'd',
        expressionAttributeValues: 'e',
      };
      updateStub.resolves({});

      await common.updateObject(params).should.be.fulfilled;
      sinon.assert.calledWith(documentStub.update, {
        TableName: config.dynamodb.table,
        Key: params.key,
        UpdateExpression: params.updateExpression,
        ConditionExpression: params.conditionExpression,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ExpressionAttributeValues: params.expressionAttributeValues,
      });
    });

    it('should successfully update an object in Dynamodb without conditionExpression or expressionAttributeNames', async () => {
      const params = {
        key: 'a',
        updateExpression: 'b',
        expressionAttributeNames: 'd',
        expressionAttributeValues: 'e',
      };
      updateStub.resolves({});

      await common.updateObject(params).should.be.fulfilled;
      sinon.assert.calledWith(documentStub.update, {
        TableName: config.dynamodb.table,
        Key: params.key,
        UpdateExpression: params.updateExpression,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ExpressionAttributeValues: params.expressionAttributeValues,
      });
    });

    it('should handle errors from Dynamodb', async () => {
      const params = {
        key: 'a',
        updateExpression: 'b',
        expressionAttributeNames: 'd',
        expressionAttributeValues: 'e',
      };
      const error = new Error('bad');
      updateStub.rejects(error);

      await common.updateObject(params).should.be.rejectedWith(error);
      sinon.assert.calledOnce(errorSpy);
    });
  });

  describe('queryObjects', () => {
    it('should successfully query an object in Dynamodb with all parameters', async () => {
      const params = {
        projectionExpressions: 'a',
        keyConditionExpression: 'b',
        expressionAttributeNames: 'c',
        expressionAttributeValues: 'd',
        filterExpression: 'e',
        indexName: 'f',
      };
      queryStub.resolves({Items: []});

      await common.queryObjects(params).should.become([]);
      sinon.assert.calledWith(documentStub.query, {
        TableName: config.dynamodb.table,
        KeyConditionExpression: params.keyConditionExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ProjectionExpression: params.projectionExpressions,
        IndexName: params.indexName,
        ExpressionAttributeNames: params.expressionAttributeNames,
        FilterExpression: params.filterExpression,
      });
    });

    it('should successfully query an object in Dynamodb with partial parameters', async () => {
      const params = {
        keyConditionExpression: 'b',
        expressionAttributeValues: 'd',
      };
      queryStub.resolves({Items: []});

      await common.queryObjects(params).should.become([]);
      sinon.assert.calledWith(documentStub.query, {
        TableName: config.dynamodb.table,
        KeyConditionExpression: params.keyConditionExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
      });
    });

    it('should successfully handle paginated results and recursion', async () => {
      const LastEvaluatedKey = 'a';
      const params = {
        keyConditionExpression: 'b',
        expressionAttributeValues: 'd',
      };
      queryStub.onFirstCall().resolves({Items: ['a'], LastEvaluatedKey});
      queryStub.onSecondCall().resolves({Items: ['b']});


      await common.queryObjects(params).should.become(['a', 'b']);
      sinon.assert.calledTwice(documentStub.query);
      sinon.assert.calledWith(documentStub.query, {
        TableName: config.dynamodb.table,
        KeyConditionExpression: params.keyConditionExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
      });
      sinon.assert.calledWith(documentStub.query, {
        TableName: config.dynamodb.table,
        KeyConditionExpression: params.keyConditionExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ExclusiveStartKey: LastEvaluatedKey,
      });
    });

    it('should handle errors from Dynamodb', async () => {
      const params = {
        keyConditionExpression: 'b',
        expressionAttributeValues: 'd',
      };
      const error = new Error('bad');
      queryStub.rejects(error);

      await common.queryObjects(params).should.be.rejectedWith(error);
      sinon.assert.calledOnce(errorSpy);
    });
  });
});
