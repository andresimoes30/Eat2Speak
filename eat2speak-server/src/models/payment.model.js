module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    paymentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    learnerPercentage: {
      type: DataTypes.DECIMAL(5, 2)
    },
    nativePercentage: {
      type: DataTypes.DECIMAL(5, 2)
    },
    restaurantShare: {
      type: DataTypes.DECIMAL(5, 2)
    },
    platformShare: {
      type: DataTypes.DECIMAL(5, 2)
    },
    totalAmount: {
      type: DataTypes.DECIMAL(6, 2)
    }
  }, {
    tableName: 'Payment',
    timestamps: false
  });

  return Payment;
};
