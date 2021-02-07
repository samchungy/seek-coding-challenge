const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');

chai.use(chaiPromimsed);
chai.should();

describe('Error - Route Error', () => {
  const RouteError = require('../src/errors/route-error');

  describe('getPrice', () => {
    it('should have a statusCode and response property', async () => {
      const statusCode = 500;
      const response = 'test';
      const error = new RouteError(statusCode, response);
      error.statusCode.should.equal(statusCode);
      error.response.should.equal(response);
      error.message.should.equal(`${statusCode} route error`);
    });
  });
});
