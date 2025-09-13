const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Customer", {
    shopifyId: { type: DataTypes.BIGINT, allowNull: false, unique: 'shop_customer_unique' },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    indexes: [
      { fields: ['tenantId'] },
      { unique: true, name: 'shop_customer_unique', fields: ['shopifyId', 'tenantId'] } // compound unique
    ]
  });
};
