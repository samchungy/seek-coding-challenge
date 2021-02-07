const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

chai.use(chaiPromimsed);
chai.should();

describe('Dal Dynamodb Index', () => {
  const sandbox = sinon.createSandbox();
  const commonStub = sandbox.stub();
  const customerStub = sandbox.stub();
  const productStub = sandbox.stub();

  const config = {
    dynamodb: {
      connection: 'url',
      table: 'table',
    },
  };

  let index;
  const client = {};

  before(() => {
    commonStub.returns(client);
    index = proxyquire('../src/dal/dynamodb', {
      './common': commonStub,
      './customer': customerStub,
      './product': productStub,
    })({config});
  });

  describe('index', () => {
    it('should successfully return all dals', async () => {
      const dalList = ['customer', 'product'];
      index.should.contain.keys(dalList);

      sinon.assert.calledWith(commonStub, {config});
      sinon.assert.calledWith(customerStub, {config, client});
      sinon.assert.calledWith(productStub, {config, client});
    });
  });
});
