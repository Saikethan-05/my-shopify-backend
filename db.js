const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("shopify_db", "root", "Saikethan@2005", {
  host: "localhost",
  dialect: "mysql",
});

sequelize.authenticate()
  .then(() => console.log("MySQL connected!"))
  .catch(err => console.error("MySQL connection error:", err));

module.exports = sequelize;
