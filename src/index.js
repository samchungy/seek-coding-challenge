const Koa = require('koa');
const router = require('koa/router')();
const koaBody = require('koa-body');

const config = require('./config');
const db = require('./dal/dynamodb')({config});
const cart = require('./services/cart')({config, db});

const app = new Koa();
app.use(koaBody());

router.post('add', async (ctx) => {

});

router.get('total', async (ctx) => {

});

app.use(router.routes());

app.listen(3000);
