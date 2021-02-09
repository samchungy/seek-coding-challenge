const customerDal = ({config, client}) => {
  const addToCart = async ({cartItem, customerId}) => {
    const params = {
      key: {pk: customerId, sk: customerId},
      updateExpression: 'set cart = list_append(if_not_exists(cart, :emptyList), :cartItem)',
      expressionAttributeValues: {
        ':cartItem': [cartItem],
        ':emptyList': [],
      },
    };
    await client.updateObject(params);
  };

  const updateCartQty = async ({foundIndex, customerId, quantity=1}) => {
    const params = {
      key: {pk: customerId, sk: customerId},
      updateExpression: `ADD cart[${foundIndex}].qty :quantity`,
      expressionAttributeValues: {
        ':quantity': quantity,
      },
    };
    await client.updateObject(params);
  };

  const getCustomer = async ({customerId}) => {
    const params = {
      key: {pk: customerId, sk: customerId},
    };
    return await client.getObject(params);
  };

  const findDiscountGroups = async ({customerId}) => {
    const params = {
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :dgp)',
      expressionAttributeValues: {
        ':pk': customerId,
        ':dgp': config.discountGroup.prefix,
      },
    };
    return await client.queryObjects(params);
  };

  return {
    addToCart,
    findDiscountGroups,
    getCustomer,
    updateCartQty,
  };
};

module.exports = customerDal;
