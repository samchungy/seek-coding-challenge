// Quantity based discount eg. 3 for 2
const quantityRule = ({config}) => {
  const getPrice = ({price, qty, discount}) => {
    const discountNumber = Math.floor(qty/discount.qty); // The number of times this discount applies
    const nonDiscountNumber = qty%discount.qty;
    if (!discountNumber) {
      return qty * price; // Did not make minimum quantity, nothing to apply
    }
    return (discountNumber * discount.qtyCost + nonDiscountNumber) * price;
  };
  return {
    getPrice,
  };
};

module.exports = quantityRule;
