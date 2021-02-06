// Flat discount eg. $399 -> $299
const flatRule = ({config}) => {
  const getPrice = ({qty, discount}) => {
    return qty * discount.price;
  };
  return {
    getPrice,
  };
};

module.exports = flatRule;
