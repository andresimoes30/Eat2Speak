module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    restaurantId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ownerUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuisineType: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    seatsPerTable: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    availableTables: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    commissionPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.0
    }
  });

  Restaurant.associate = (models) => {
    Restaurant.belongsTo(models.User, {
      foreignKey: 'ownerUserId',
      as: 'owner'
    });
  };

  return Restaurant;
};
