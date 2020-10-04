const app = require('express')();

app.use('/', require('./index'));
app.use('/auth', require('./auth'));

module.exports = app;
