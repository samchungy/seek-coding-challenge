// Quantity based discount eg. 3 for 2
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
