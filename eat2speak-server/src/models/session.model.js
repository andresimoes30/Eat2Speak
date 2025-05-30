module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sessionId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    learnerUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nativeUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    totalPrice: {
      type: DataTypes.DECIMAL(6, 2)
    },
    tableSize: {
      type: DataTypes.TINYINT.UNSIGNED
    },
    languageUsed: {
      type: DataTypes.STRING(50)
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    cancelReason: {
      type: DataTypes.TEXT
    },
    cancelledAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'Session',
    timestamps: false
  });

  return Session;
};
