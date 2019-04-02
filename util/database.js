const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs_max', 'root', 'Wiwi12345', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
});

module.exports = sequelize;