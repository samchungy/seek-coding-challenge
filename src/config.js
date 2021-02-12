module.exports = {
  port: 3000,
  dynamodb: {
    connection: {
      endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
    },
    table: process.env.AWS_DYNAMODB_TABLE,
    secondaryIndex: {
      mainKeys: 'skIndex',
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
      quantityFlat: 'quantityFlat',
    },
  },
  codes: {
    internalServer: 500,
    badRequest: 400,
  },
  addItem: {
    successCode: 200,
    success: 'Product successfully added',
    noCustomer: 'Customer does not exist',
    noProduct: 'Product does not exist',
  },
  total: {
    successCode: 200,
  },
};
