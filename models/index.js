const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME     || process.env.MYSQLDATABASE,
  process.env.DB_USER     || process.env.MYSQLUSER,
  process.env.DB_PASS     || process.env.MYSQLPASSWORD,
  {
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
  }
);

const Tenant = require("./Tenant")(sequelize);
const Product = require("./Product")(sequelize);
const Customer = require("./Customer")(sequelize);
const Order = require("./Order")(sequelize);

module.exports = { sequelize, Tenant, Product, Customer, Order };
