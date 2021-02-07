const chai = require('chai');
const chaiPromimsed = require('chai-as-promised');
const config = require('../src/config');

chai.use(chaiPromimsed);
chai.should();

describe('Rule Index', () => {
  const index = require('../src/rules')({config});

  describe('index', () => {
    it('should successfully return all rules listed in config', async () => {
      index.should.contain.keys(config.discount.codes);
    });
  });
});
