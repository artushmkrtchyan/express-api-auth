const mongoose = require('mongoose');
const config = require('./config');

module.exports = async function () {
    return await mongoose.connect(config.DB_URL, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
};
