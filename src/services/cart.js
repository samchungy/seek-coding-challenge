const ruleFactory = require('../rules');
const {getUnixTime} = require('../util/time');

const cart = ({config, db}) => {
  const rules = ruleFactory({config});
  const customerDal = db.customer;
  const productDal = db.product;

  // Endpoints

  const add = async ({product, customerId}) => {
    const customer = await customerDal.getCustomer({customerId});
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
    const customer = await customerDal.getCustomer({customerId});
    const {cart} = customer;
    if (!cart || !cart.length) {
      // Empty Cart
      return {total: 0, discountTotal: 0};
    }

    const [products, discounts, discountGroups] = await Promise.all([
      getProducts({cart}),
      getDiscounts({cart}),
      getDiscountGroups({customerId}),
    ]);

    const applicableDiscounts = discounts.filter((d) => discountGroups.find((dg) => dg.sk === d.discountGroup ));

    const {total, discountTotal} = cart.reduce(({total, discountTotal}, item) => {
      const product = products.find((p) => p.pk === item.id);
      const discount = applicableDiscounts.find((ad) => ad.pk === product.pk);
      const itemTotal = (item.qty * product.price);
      return {
        total: total + itemTotal,
        discountTotal: discountTotal + applyDiscount({discount, price: product.price, qty: item.qty, itemTotal}),
      };
    }, {total: 0, discountTotal: 0});
    return {total, discountTotal};
  };


  // Helpers

  const applyDiscount = ({discount, price, qty, itemTotal}) => {
    if (discount) {
      const ruleSet = rules[discount.rule];
      return ruleSet.getPrice({price, qty, discount});
    }
    return itemTotal;
  };

  const getProducts = async ({cart}) => {
    const products = await Promise.all(cart.map(({id}) => productDal.getProduct({id})));
    return products.flat();
  };

  const getDiscounts = async ({cart}) => {
    const discounts = await Promise.all(cart.map(({id}) => productDal.findDiscounts({id, ttl: getUnixTime()})));
    return discounts.flat();
  };

  const getDiscountGroups = async ({customerId}) => {
    return customerDal.findDiscountGroups({customerId});
  };

  return {
    add,
    total,
  };
};

module.exports = cart;

