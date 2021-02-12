const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const sinon = require('sinon');

chai.use(chaiPromimsed);
chai.should();

describe('Service Cart', () => {
  const sandbox = sinon.createSandbox();
  const customerDal = {
    getCustomer: sandbox.stub(),
    updateCartQty: sandbox.stub(),
    addToCart: sandbox.stub(),
    findDiscountGroups: sandbox.stub(),
  };
  const productDal = {
    getProduct: sandbox.stub(),
    findDiscounts: sandbox.stub(),
  };
  const rules = {
    qty: {
      getPrice: sandbox.stub(),
    },
    flat: {
      getPrice: sandbox.stub(),
    },
  };

  afterEach(() => {
    sandbox.reset();
  });

  const config = {
    dynamodb: {
      connection: 'url',
      table: 'table',
    },
    codes: {
      internalServer: 500,
      badRequest: 400,
    },
    addItem: {
      successCode: 200,
      success: 'Product successfully added',
      noCustomer: 'Customer does not exist',
    },
  };

  const db = {
    customer: customerDal,
    product: productDal,
  };

  const cart = require('../src/services/cart')({config, db, rules});

  describe('add', () => {
    it('should successfully add a product to the cart of a customer without a cart', async () => {
      const params = {
        product: 'product-000001',
        customerId: 'test',
      };
      const customer = {
        pk: 'test',
      };
      const product = {
        id: 'product-000001',
      };
      customerDal.getCustomer.resolves(customer);
      customerDal.addToCart.resolves();
      productDal.getProduct.resolves(product);

      await cart.add(params).should.be.fulfilled;
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
      sinon.assert.calledWith(customerDal.addToCart, {
        cartItem: {
          qty: 1,
          id: params.product,
        },
        customerId: params.customerId,
      });
    });

    it('should successfully add a product to the cart of a customer with other products', async () => {
      const params = {
        product: 'product-000001',
        customerId: 'test',
      };
      const customer = {
        pk: 'test',
        cart: [{
          qty: 1,
          id: 'product-000002',
        }],
      };
      const product = {
        id: 'product-000001',
      };
      customerDal.getCustomer.resolves(customer);
      customerDal.addToCart.resolves();
      productDal.getProduct.resolves(product);

      await cart.add(params).should.be.fulfilled;
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
      sinon.assert.calledWith(customerDal.addToCart, {
        cartItem: {
          qty: 1,
          id: params.product,
        },
        customerId: params.customerId,
      });
    });

    it('should successfully update the quanitity of an item in the carts', async () => {
      const params = {
        product: 'product-000001',
        customerId: 'test',
      };
      const item = {
        qty: 1,
        id: 'product-000001',
      };
      const customer = {
        pk: 'test',
        cart: [item],
      };
      const product = {
        id: 'product-000001',
      };
      customerDal.getCustomer.resolves(customer);
      customerDal.updateCartQty.resolves();
      productDal.getProduct.resolves(product);

      await cart.add(params).should.be.fulfilled;
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
      sinon.assert.calledWith(customerDal.updateCartQty, {
        foundIndex: 0,
        customerId: params.customerId,
      });
    });

    it('should successfully handle a non existant customer', async () => {
      const params = {
        product: 'product-000001',
        customerId: 'test',
      };
      customerDal.getCustomer.resolves(null);

      await cart.add(params).should.be.rejected;
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
    });

    it('should successfully handle a non existant product', async () => {
      const params = {
        product: 'product-000001',
        customerId: 'test',
      };
      const item = {
        qty: 1,
        id: 'product-000001',
      };
      const customer = {
        pk: 'test',
        cart: [item],
      };
      customerDal.getCustomer.resolves(customer);
      productDal.getProduct.resolves(null);

      await cart.add(params).should.be.rejected;
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
    });
  });

  describe('total', () => {
    it('should successfully calculate the cart total of a customer without a cart', async () => {
      const params = {
        customerId: 'test',
      };
      const customer = {
        pk: 'test',
      };
      customerDal.getCustomer.resolves(customer);

      await cart.total(params).should.become({total: 0, discountTotal: 0});
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
    });

    it('should successfully calculate the cart total of a customer with an empty cart', async () => {
      const params = {
        customerId: 'test',
      };
      const customer = {
        pk: 'test',
        cart: [],
      };
      customerDal.getCustomer.resolves(customer);

      await cart.total(params).should.become({total: 0, discountTotal: 0});
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
    });

    it('should successfully calculate the cart total of a customer with an item in the cart with no discount', async () => {
      const params = {
        customerId: 'test',
      };
      const item = {
        qty: 1,
        id: 'product-classic',
      };
      const customer = {
        pk: 'test',
        cart: [item],
      };
      const product = {
        pk: 'product-classic',
        sk: 'product-classic',
        name: 'Classic Ad',
        price: 269.99,
        description: 'Offers the most basic level of advertisement',
        discount: null,
        stock: 999,
      };
      const discountGroups = [
        {
          'pk': 'test',
          'sk': 'discount_group-98964169-bb88-4924-9354-66422b49b05d',
        },
      ];
      const discounts = [];
      customerDal.getCustomer.resolves(customer);
      customerDal.findDiscountGroups.resolves(discountGroups);
      productDal.getProduct.resolves(product);
      productDal.findDiscounts.resolves(discounts);

      await cart.total(params).should.become({total: 269.99, discountTotal: 269.99});
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
      sinon.assert.calledWith(customerDal.findDiscountGroups, {customerId: params.customerId});
      sinon.assert.calledWith(productDal.getProduct, {id: item.id});
      sinon.assert.calledWith(productDal.findDiscounts, {id: item.id, ttl: sinon.match.number, discountGroups: discountGroups.map((dg) => dg.sk)});
    });

    it('should successfully calculate the cart total of a customer with items in the cart with a quantity discount', async () => {
      const params = {
        customerId: 'test',
      };
      const item = {
        qty: 3,
        id: 'product-classic',
      };
      const customer = {
        pk: 'test',
        cart: [item],
      };
      const product = {
        pk: 'product-classic',
        sk: 'product-classic',
        name: 'Classic Ad',
        price: 269.99,
        description: 'Offers the most basic level of advertisement',
        discount: null,
        stock: 999,
      };
      const discountGroups = [
        {
          'pk': 'test',
          'sk': 'discount_group-98964169-bb88-4924-9354-66422b49b05d',
        },
      ];
      const discounts = [
        {
          'pk': 'product-classic',
          'sk': 'discount-310efb0f-8a8a-42d7-b4e2-2b327bcb1fdc',
          'discountGroup': 'discount_group-98964169-bb88-4924-9354-66422b49b05d',
          'rule': 'qty',
          'qty': 3,
          'qtyCost': 2,
        },
      ];
      customerDal.getCustomer.resolves(customer);
      customerDal.findDiscountGroups.resolves(discountGroups);
      productDal.getProduct.resolves(product);
      productDal.findDiscounts.resolves(discounts);
      rules.qty.getPrice.returns(539.98);

      await cart.total(params).should.become({total: 809.97, discountTotal: 539.98});
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
      sinon.assert.calledWith(customerDal.findDiscountGroups, {customerId: params.customerId});
      sinon.assert.calledWith(productDal.getProduct, {id: item.id});
      sinon.assert.calledWith(productDal.findDiscounts, {id: item.id, ttl: sinon.match.number, discountGroups: discountGroups.map((dg) => dg.sk)});
    });

    it('should successfully calculate the cart total of a customer with items in the cart with a flat discount and a quantity discount', async () => {
      const params = {
        customerId: 'test',
      };
      const item = {
        qty: 3,
        id: 'product-classic',
      };
      const item2 = {
        qty: 3,
        id: 'product-stand_out',
      };
      const customer = {
        pk: 'test',
        cart: [item, item2],
      };
      const product = {
        pk: 'product-classic',
        sk: 'product-classic',
        name: 'Classic Ad',
        price: 269.99,
        description: 'Offers the most basic level of advertisement',
        discount: null,
        stock: 999,
      };
      const product2 = {
        pk: 'product-stand_out',
        sk: 'product-stand_out',
        name: 'Stand out Ad',
        price: 322.99,
        description: 'Allows advertisers to use a company logo and use a longer presentation text',
        discount: null,
        stock: 999,
      };
      const discountGroups = [
        {
          'pk': 'test',
          'sk': 'discount_group-98964169-bb88-4924-9354-66422b49b05d',
        },
      ];
      const discounts = [
        {
          'pk': 'product-classic',
          'sk': 'discount-310efb0f-8a8a-42d7-b4e2-2b327bcb1fdc',
          'discountGroup': 'discount_group-98964169-bb88-4924-9354-66422b49b05d',
          'rule': 'flat',
          'price': 169.99,
        },
      ];
      const discounts2 = [
        {
          'pk': 'product-stand_out',
          'sk': 'discount-1718b519-c133-4e48-8dc3-eb8107f17bc7',
          'discountGroup': 'discount_group-98964169-bb88-4924-9354-66422b49b05d',
          'rule': 'qty',
          'qty': 3,
          'qtyCost': 2,
        },
      ];
      customerDal.getCustomer.resolves(customer);
      customerDal.findDiscountGroups.resolves(discountGroups);
      productDal.getProduct.onFirstCall().resolves(product);
      productDal.getProduct.onSecondCall().resolves(product2);
      productDal.findDiscounts.onFirstCall().resolves(discounts);
      productDal.findDiscounts.onSecondCall().resolves(discounts2);
      rules.flat.getPrice.returns(509.97);
      rules.qty.getPrice.returns(645.98);

      await cart.total(params).should.become({total: 1778.94, discountTotal: 1155.95});
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
      sinon.assert.calledWith(customerDal.findDiscountGroups, {customerId: params.customerId});
      sinon.assert.calledWith(productDal.getProduct, {id: item.id});
      sinon.assert.calledWith(productDal.getProduct, {id: item2.id});
      sinon.assert.calledWith(productDal.findDiscounts, {id: item.id, ttl: sinon.match.number, discountGroups: discountGroups.map((dg) => dg.sk)});
      sinon.assert.calledWith(productDal.findDiscounts, {id: item2.id, ttl: sinon.match.number, discountGroups: discountGroups.map((dg) => dg.sk)});
    });

    it('should successfully handle invalid customer', async () => {
      const params = {
        customerId: 'test',
      };
      customerDal.getCustomer.resolves(null);

      await cart.total(params).should.be.rejected;
      sinon.assert.calledWith(customerDal.getCustomer, {customerId: params.customerId});
    });
  });
});
