const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');

chai.use(chaiPromimsed);
chai.should();

describe('Rule - Quantity Flat Discount', () => {
  const config = {};
  const quantityRule = require('../src/rules/quantity-flat')({config});

  describe('getPrice', () => {
    it('should apply 3 or more , price drops to $5', async () => {
      const qty = 3;
      const price = 10;
      const discount = {qty: 3, price: 5};
      quantityRule.getPrice({price, qty, discount}).should.equal(15);
    });

    it('should not apply 3 or more, price of item should remain at 10', async () => {
      const qty = 2;
      const price = 10;
      const discount = {qty: 3, price: 5};
      quantityRule.getPrice({price, qty, discount}).should.equal(20);
    });
  });
});
