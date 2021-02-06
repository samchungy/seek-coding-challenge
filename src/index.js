const Koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body');

const config = require('./config');
const db = require('./dal/dynamodb')({config});
const cart = require('./services/cart')({config, db});

const app = new Koa();
app.use(koaBody());

router.post('/add', async (ctx) => {
  const headers = ctx.request.headers;
  const body = ctx.request.body;
  await cart.add({
    product: body.product,
    customerId: headers['customer-id'],
  }).catch((err) => {
    console.error(err, 'Unhandled Error in Add Cart');
    return ctx.throw(config.codes.internalServer);
  });
  ctx.body = config.addItem.success;
  ctx.status = config.addItem.successCode;
});

router.get('/total', async (ctx) => {
  const headers = ctx.request.headers;
  const total = await cart.total({
    customerId: headers['customer-id'],
  }).catch((err) => {
    console.error(err, 'Unhandled Error in Fetching Cart Total');
    return ctx.throw(config.codes.internalServer);
  });
  ctx.body = total;
  ctx.status = config.total.successCode;
});

app.use(router.routes());

app.listen(config.port);
