const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { host: process.env.DB_HOST, dialect: "mysql" }
);

const Tenant = require("./Tenant")(sequelize);
const Product = require("./Product")(sequelize);
const Customer = require("./Customer")(sequelize);
const Order = require("./Order")(sequelize);

module.exports = { sequelize, Tenant, Product, Customer, Order };
