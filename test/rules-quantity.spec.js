const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');

chai.use(chaiPromimsed);
chai.should();

describe('Rule - Quantity Discount', () => {
  const config = {};
  const quantityRule = require('../src/rules/quantity')({config});

  describe('getPrice', () => {
    it('should apply a 3 for 2 deal exactly one time or 3 items', async () => {
      const qty = 3;
      const discount = {qty: 3, qtyCost: 2};
      const price = 199.99;
      quantityRule.getPrice({price, qty, discount}).should.equal(399.98);
    });

    it('should apply a 3 for 2 deal exactly one time on 4 items', async () => {
      const qty = 4;
      const discount = {qty: 3, qtyCost: 2};
      const price = 199.99;
      quantityRule.getPrice({price, qty, discount}).should.equal(599.97);
    });

    it('should apply a 2 for 1 deal exactly three times on 7 items', async () => {
      const qty = 7;
      const discount = {qty: 2, qtyCost: 1};
      const price = 29.99;
      quantityRule.getPrice({price, qty, discount}).should.equal(119.96);
    });

    it('should apply a 3 for 2 deal no times on 2 items', async () => {
      const qty = 2;
      const discount = {qty: 3, qtyCost: 2};
      const price = 199.99;
      quantityRule.getPrice({price, qty, discount}).should.equal(399.98);
    });
  });
});
