const {getUnixTime} = require('../util/time');
const RouteError = require('../errors/route-error');

const cart = ({config, db, rules}) => {
  const customerDal = db.customer;
  const productDal = db.product;

  // Endpoints

  const add = async ({product, customerId}) => {
    const customer = await checkCustomer({customerId});

    const productDetails = await productDal.getProduct({id: product});
    if (!productDetails) {
      throw new RouteError(config.codes.badRequest, config.addItem.noProduct);
    }
    const foundIndex = customer && customer.cart && customer.cart.findIndex((item) => item.id === product);
    if (foundIndex !== undefined && foundIndex !== -1) {
      await customerDal.updateCartQty({foundIndex, customerId});
    } else {
      // Maybe move this to a models folder in future.
      const cartItem = {
        qty: 1,
        id: product,
      };
      await customerDal.addToCart({cartItem, customerId});
    }
  };

  const total = async ({customerId}) => {
    const customer = await checkCustomer({customerId});
    const {cart} = customer;
    if (!cart || !cart.length) {
      // Empty Cart
      return {total: 0, discountTotal: 0};
    }
    const discountGroups = await getDiscountGroups({customerId});
    const {products, discounts} = await queryProducts({cart, discountGroups});

    const {total, discountTotal} = cart.reduce(({total, discountTotal}, item) => {
      const product = products.find((p) => p.pk === item.id);
      const discount = discounts.find((ad) => ad.pk === product.pk);
      const itemTotal = (item.qty * product.price);
      return {
        total: total + itemTotal,
        discountTotal: discountTotal + applyDiscount({discount, price: product.price, qty: item.qty, itemTotal}),
      };
    }, {total: 0, discountTotal: 0});
    return {total, discountTotal};
  };


  // Helpers


  const queryProducts = async ({cart, discountGroups}) => {
    const [productResults, discountResults] = await Promise.all([
      Promise.all(cart.map(({id}) => productDal.getProduct({id}))),
      Promise.all(cart.map(({id}) => productDal.findDiscounts({id, discountGroups, ttl: getUnixTime()}))),
    ]);
    return {
      products: productResults.flat(),
      discounts: discountResults.flat(),
    };
  };

  const checkCustomer = async ({customerId}) => {
    const customer = await customerDal.getCustomer({customerId});
    if (!customer) {
      throw new RouteError(config.codes.badRequest, config.addItem.noCustomer);
    }
    return customer;
  };

  const applyDiscount = ({discount, price, qty, itemTotal}) => {
    if (discount) {
      const ruleSet = rules[discount.rule];
      return ruleSet.getPrice({price, qty, discount});
    }
    return itemTotal;
  };

  const getDiscountGroups = async ({customerId}) => {
    const dgResults = await customerDal.findDiscountGroups({customerId});
    return dgResults.map((dg) => dg.sk);
  };

  return {
    add,
    total,
  };
};

module.exports = cart;

