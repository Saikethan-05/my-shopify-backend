


const { sequelize, DataTypes } = require("./db");

// Product Model
const Product = sequelize.define("Product", {
  shopifyId: { type: DataTypes.BIGINT, unique: true },
  title: DataTypes.STRING,
  vendor: DataTypes.STRING,
  price: DataTypes.STRING,
});

// Customer Model
const Customer = sequelize.define("Customer", {
  shopifyId: { type: DataTypes.BIGINT, unique: true },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
});

// Order Model
const Order = sequelize.define("Order", {
  shopifyId: { type: DataTypes.BIGINT, unique: true },
  customerId: DataTypes.BIGINT,
  total_price: DataTypes.STRING,
  currency: DataTypes.STRING,
  created_at: DataTypes.DATE,
});

// Sync tables
sequelize.sync({ alter: true })
  .then(() => console.log("✅ Tables created/updated"))
  .catch((err) => console.error(err));

module.exports = { Product, Customer, Order };
