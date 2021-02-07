const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const sinon = require('sinon');

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
      it('should successfully call the client with query', async () => {
        const params = {
          id: 'test',
          ttl: 12345,
        };
        const result = ['a'];
        client.queryObjects.resolves(result);

        await productDal.findDiscounts(params).should.become(result);
        sinon.assert.calledOnce(client.queryObjects);
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({expressionAttributeValues: {':pk': params.id, ':dgp': config.discount.prefix, ':cttl': params.ttl}}),
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
