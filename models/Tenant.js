const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Tenant", {
    name: { type: DataTypes.STRING, allowNull: false },
    shop: { type: DataTypes.STRING, allowNull: false, unique: true },
    accessToken: { type: DataTypes.STRING, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  });
};
