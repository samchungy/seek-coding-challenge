const productDal = ({config, client}) => {
  const findDiscounts = async ({id, ttl}) => {
    const params = {
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :dgp)',
      expressionAttributeValues: {
        ':pk': id,
        ':dgp': config.discount.prefix,
        ':cttl': ttl,
      },
      expressionAttributeNames: {
        '#ttl': 'ttl',
      },
      filterExpression: 'attribute_not_exists(#ttl) OR #ttl > :cttl',
    };

    return await client.queryObjects(params);
  };

  const getProduct = async ({id}) => {
    const params = {
      key: {pk: id, sk: id},
    };
    return await client.getObject(params);
  };


  return {
    findDiscounts,
    getProduct,
  };
};

module.exports = productDal;
