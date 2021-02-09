const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const sinon = require('sinon');
const {discountGroup} = require('../src/config');

chai.use(chaiPromimsed);
chai.should();

describe('Product Dal', () => {
  const sandbox = sinon.createSandbox();
  const client = {
    updateObject: sandbox.stub(),
    getObject: sandbox.stub(),
    queryObjects: sandbox.stub(),
  };

  const config = {
    dynamodb: {
      connection: 'url',
      table: 'table',
    },
    discount: {
      prefix: 'discount-',
    },
  };

  const productDal = require('../src/dal/dynamodb/product')({config, client});

  afterEach(() => {
    sandbox.reset();
  });

  describe('Product DAL', () => {
    describe('findDiscounts', () => {
      it('should successfully call the client with query with multiple discount groups', async () => {
        const params = {
          id: 'test',
          ttl: 12345,
          discountGroups: ['discount_group-123', 'discount_group-345'],
        };
        const result = ['a'];
        client.queryObjects.resolves(result);

        await productDal.findDiscounts(params).should.become(result);
        sinon.assert.calledOnce(client.queryObjects);
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({expressionAttributeValues: {
              ':pk': params.id,
              ':dp': config.discount.prefix,
              ':cttl': params.ttl,
              ':dg0': params.discountGroups[0],
              ':dg1': params.discountGroups[1],
            }}),
        );
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({filterExpression: `(attribute_not_exists(#ttl) OR #ttl > :cttl) AND #dg IN (:dg0, :dg1)`}),
        );
      });

      it('should successfully call the client with query with 100 discount groups', async () => {
        const params = {
          id: 'test',
          ttl: 12345,
          discountGroups: new Array(100).fill().map((a, i) => 'dg' + i),
        };
        const result = ['a'];
        const result2 = ['b'];
        const filterExpression = params.discountGroups.slice(0, 97).map((_id, index) => `:dg${index}`).join(', ');
        const filterExpression2 = params.discountGroups.slice(97, 100).map((_id, index) => `:dg${index}`).join(', ');
        client.queryObjects.onFirstCall().resolves(result);
        client.queryObjects.onSecondCall().resolves(result2);

        await productDal.findDiscounts(params).should.become([...result, ...result2]);
        sinon.assert.calledTwice(client.queryObjects);
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({expressionAttributeValues: {
              ':pk': params.id,
              ':dp': config.discount.prefix,
              ':cttl': params.ttl,
              ...params.discountGroups.slice(0, 97).reduce((dgs, dg, index) => (dgs[`:dg${index}`] = dg, dgs), {}),
            }}),
        );
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({filterExpression: `(attribute_not_exists(#ttl) OR #ttl > :cttl) AND #dg IN (${filterExpression})`}),
        );
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({expressionAttributeValues: {
              ':pk': params.id,
              ':dp': config.discount.prefix,
              ':cttl': params.ttl,
              ...params.discountGroups.slice(97, 100).reduce((dgs, dg, index) => (dgs[`:dg${index}`] = dg, dgs), {}),
            }}),
        );
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({filterExpression: `(attribute_not_exists(#ttl) OR #ttl > :cttl) AND #dg IN (${filterExpression2})`}),
        );
      });
    });

    describe('getProduct', () => {
      it('should successfully call the client with query', async () => {
        const params = {
          id: 'test',
        };
        const product = {
          id: 'test',
          property: 'yay',
        };
        client.getObject.resolves(product);

        await productDal.getProduct(params).should.become(product);
        sinon.assert.calledOnce(client.getObject);
        sinon.assert.calledWithMatch(client.getObject, sinon.match({key: {sk: params.id, sk: params.id}}));
      });
    });
  });
});
