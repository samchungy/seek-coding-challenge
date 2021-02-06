const commonDbFactory = require('./common');
const customer = require('./customer');
const product = require('./product');

module.exports = ({config}) => {
  const client = commonDbFactory({config});

  return {
    customer: customer({config, client}),
    product: product({config, client}),
  };
};
