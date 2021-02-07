const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const request = require('supertest');
const config = require('../src/config');
const RouteError = require('../src/errors/route-error');

chai.use(chaiPromimsed);
chai.should();

describe('Index', () => {
  const sandbox = sinon.createSandbox();

  const dbStub = sandbox.spy(() => {});
  const ruleStub = sandbox.stub();
  const cartStub = {
    add: sandbox.stub(),
    total: sandbox.stub(),
  };
  const serviceCartStub = sandbox.spy(() => cartStub);

  let app;

  before(() => {
    app = proxyquire.load('../src/index', {
      './dal/dynamodb': dbStub,
      './rules': ruleStub,
      './services/cart': serviceCartStub,
    });
  });

  beforeEach(() => {
    sandbox.reset();
  });

  after(() => {
    app.close();
    sandbox.reset();
  });

  describe('add route', () => {
    it('should return successfully', async () => {
      const product = {product: 'product-stand_out'};
      cartStub.add.resolves();
      const response = await request(app)
          .post('/add')
          .set('Accept', 'application/json')
          .send(product)
          .set('customer-id', 'customer-000001');

      response.status.should.equal(config.addItem.successCode);
      response.text.should.equal(config.addItem.success);
      sinon.assert.calledWith(cartStub.add, {
        product: product.product,
        customerId: 'customer-000001',
      });
    });

    it('should return a bad request customer not found error', async () => {
      const badRequest = new RouteError(config.codes.badRequest, config.addItem.noCustomer);
      cartStub.add.rejects(badRequest);
      const response = await (request(app)
          .post('/add')
          .set('Accept', 'application/json')
          .send({product: 'product-stand_out'})
          .set('customer-id', 'customer-000001'));

      response.status.should.equal(config.codes.badRequest);
      response.text.should.equal(config.addItem.noCustomer);
    });

    it('should return a internal server error', async () => {
      const error = new Error();
      cartStub.add.rejects(error);
      const response = await (request(app)
          .post('/add')
          .set('Accept', 'application/json')
          .send({product: 'product-stand_out'})
          .set('customer-id', 'customer-000001'));

      response.status.should.equal(config.codes.internalServer);
    });
  });

  describe('total route', () => {
    it('should return successfully', async () => {
      const result = {
        total: 100,
        discountTotal: 200,
      };
      cartStub.total.resolves(result);
      const response = await request(app)
          .get('/total')
          .set('Accept', 'application/json')
          .set('customer-id', 'customer-000001');
      response.status.should.equal(config.total.successCode);
      response.body.should.deep.equal(result);
      sinon.assert.calledWith(cartStub.total, {
        customerId: 'customer-000001',
      });
    });

    it('should return a bad request customer not found error', async () => {
      const badRequest = new RouteError(config.codes.badRequest, config.addItem.noCustomer);
      cartStub.total.rejects(badRequest);
      const response = await (request(app)
          .get('/total')
          .set('Accept', 'application/json')
          .set('customer-id', 'customer-000001'));

      response.status.should.equal(config.codes.badRequest);
      response.text.should.equal(config.addItem.noCustomer);
    });

    it('should return an internal server error', async () => {
      const error = new Error();
      cartStub.total.rejects(error);
      const response = await request(app)
          .get('/total')
          .set('Accept', 'application/json')
          .set('customer-id', 'customer-000001');

      response.status.should.equal(config.codes.internalServer);
      sinon.assert.calledWith(cartStub.total, {
        customerId: 'customer-000001',
      });
    });
  });
});
