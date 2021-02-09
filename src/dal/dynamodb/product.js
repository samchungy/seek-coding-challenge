const productDal = ({config, client}) => {
  const findDiscounts = async ({id, discountGroups, ttl}) => {
    const query = async ({dgs}) => {
      // produces ':dg1: discount_group1, :dg2: discount_group1
      const dgAttributeValues = dgs.reduce((dgs, dg, index) => (dgs[`:dg${index}`] = dg, dgs), {});
      // produces ':dg1, :dg2, :dg3'
      const dgFilterExpression = dgs.map((_id, index) => `:dg${index}`).join(', ');
      const params = {
        keyConditionExpression: 'pk = :pk AND begins_with(sk, :dp)',
        expressionAttributeValues: {
          ':pk': id,
          ':dp': config.discount.prefix,
          ':cttl': ttl,
          ...dgAttributeValues,
        },
        expressionAttributeNames: {
          '#ttl': 'ttl',
          '#dg': 'discountGroup',
        },
        filterExpression: `(attribute_not_exists(#ttl) OR #ttl > :cttl) AND #dg IN (${dgFilterExpression})`,
      };
      return await client.queryObjects(params);
    };

    // Max Dynamodb Expression Attribute Values = 100 -> IF customer has more than 100 groups lol
    const limit = 97;
    const requestNum = Math.ceil(discountGroups.length/limit);
    const dgsRequests = [];
    for (let i = 0; i < requestNum; i++) {
      dgsRequests.push(discountGroups.slice(i*limit, i*limit + limit));
    };
    const dgsResults = await Promise.all(dgsRequests.map((dgs) => query({dgs})));
    return dgsResults.flat();
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
