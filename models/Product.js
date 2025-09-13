const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Product", {
    shopifyId: { type: DataTypes.BIGINT, allowNull: false, unique: 'shop_product_unique' },
    title: DataTypes.STRING,
    vendor: DataTypes.STRING,
    price: DataTypes.STRING,
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    indexes: [
      { fields: ['tenantId'] },
      { unique: true, name: 'shop_product_unique', fields: ['shopifyId', 'tenantId'] }
    ]
  });
};
