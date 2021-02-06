// Discount Rules
module.exports = ({config}) => ({
  [config.discount.codes.flat]: require('./flat'),
  [config.discount.codes.qty]: require('./quantity'),
});
