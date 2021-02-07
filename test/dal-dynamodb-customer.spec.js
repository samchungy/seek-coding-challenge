const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const sinon = require('sinon');

chai.use(chaiPromimsed);
chai.should();

describe('Customer Dal', () => {
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
    discountGroup: {
      prefix: 'discount_group-',
    },
  };

  const customerDal = require('../src/dal/dynamodb/customer')({config, client});

  afterEach(() => {
    sandbox.reset();
  });

  describe('Customer DAL', () => {
    describe('AddToCart', () => {
      it('should successfully call the client with update', async () => {
        const params = {
          cartItem: {id: 'test'},
          customerId: 'test',
        };
        client.updateObject.resolves({});

        await customerDal.addToCart(params).should.be.fulfilled;
        sinon.assert.calledOnce(client.updateObject);
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({expressionAttributeValues: {':cartItem': [params.cartItem]}}));
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({key: {sk: params.customerId, sk: params.customerId}}));
      });
    });

    describe('UpdateCartQty', () => {
      it('should successfully call the client with update with default quantity: 1', async () => {
        const params = {
          customerId: 'test',
          foundIndex: 2,
        };
        client.updateObject.resolves({});

        await customerDal.updateCartQty(params).should.be.fulfilled;
        sinon.assert.calledOnce(client.updateObject);
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({key: {sk: params.customerId, sk: params.customerId}}));
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({expressionAttributeValues: {':quantity': 1}}));
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({updateExpression: sinon.match('cart[2]')}));
      });

      it('should successfully call the client with update with different quantity', async () => {
        const params = {
          customerId: 'test',
          foundIndex: 2,
          quantity: 3,
        };
        client.updateObject.resolves({});

        await customerDal.updateCartQty(params).should.be.fulfilled;
        sinon.assert.calledOnce(client.updateObject);
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({key: {sk: params.customerId, sk: params.customerId}}));
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({expressionAttributeValues: {':quantity': params.quantity}}));
        sinon.assert.calledWithMatch(client.updateObject, sinon.match({updateExpression: sinon.match('cart[2]')}));
      });
    });

    describe('getCustomer', () => {
      it('should successfully call the client with get', async () => {
        const params = {
          customerId: 'test',
        };
        client.getObject.resolves({});

        await customerDal.getCustomer(params).should.be.fulfilled;
        sinon.assert.calledOnce(client.getObject);
        sinon.assert.calledWithMatch(client.getObject, sinon.match({key: {sk: params.customerId, sk: params.customerId}}));
      });
    });

    describe('findDiscountGroups', () => {
      it('should successfully call the client with query', async () => {
        const params = {
          customerId: 'test',
        };
        const object = ['a'];
        client.queryObjects.resolves(object);

        await customerDal.findDiscountGroups(params).should.become(object);
        sinon.assert.calledOnce(client.queryObjects);
        sinon.assert.calledWithMatch(client.queryObjects,
            sinon.match({expressionAttributeValues: {':pk': params.customerId, ':dgp': config.discountGroup.prefix}}),
        );
      });
    });
  });
});
