module.exports = {
  port: 3000,
  dynamodb: {
    connection: {
      endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
    },
    table: process.env.AWS_DYNAMODB_TABLE,
    secondaryIndex: {
      mainKeys: 'skIndexKeys',
    },
  },
  product: {
    prefix: 'product-',
  },
  customer: {
    prefix: 'customer-',
  },
  discountGroup: {
    prefix: 'discount_group-',
  },
  discount: {
    prefix: 'discount-',
    codes: {
      qty: 'qty',
      flat: 'flat',
    },
  },
  codes: {
    internalServer: 500,
  },
  addItem: {
    successCode: 200,
    success: 'Product successfully added',
  },
  total: {
    successCode: 200,
  },
};
