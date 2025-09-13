const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Order", {
    shopifyId: { type: DataTypes.BIGINT, allowNull: false, unique: 'shop_order_unique' },
    customer_id: DataTypes.BIGINT,   // Shopify customer ID
    total_price: DataTypes.STRING,
    created_at: DataTypes.DATE,
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    indexes: [
      { fields: ['tenantId'] },
      { unique: true, name: 'shop_order_unique', fields: ['shopifyId', 'tenantId'] } // compound unique
    ]
  });
};
