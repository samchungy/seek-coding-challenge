// Quantity Flat Hybrid based discount eg. Purchase more than 3 -> price of item drops to $10 each
const quantityFlatRule = ({config}) => {
  const getPrice = ({price, qty, discount}) => {
    if (qty >= discount.qty) {
      return discount.price * qty;
    }
    return price * qty;
  };
  return {
    getPrice,
  };
};

module.exports = quantityFlatRule;
