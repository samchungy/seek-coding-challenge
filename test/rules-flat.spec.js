const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');

chai.use(chaiPromimsed);
chai.should();

describe('Rule - Flat Discount', () => {
  const config = {};
  const flatRule = require('../src/rules/flat')({config});

  describe('getPrice', () => {
    it('should successfully multiply a quantity by a price', async () => {
      const qty = 3;
      const discount = {price: 299.99};
      flatRule.getPrice({qty, discount}).should.equal(899.97);
    });
  });
});
