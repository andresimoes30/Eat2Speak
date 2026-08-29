// models/FavoriteRestaurant.js

module.exports = (sequelize, DataTypes) => {
  const FavoriteRestaurant = sequelize.define('FavoriteRestaurant', {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    RestaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    }
  }, {
    tableName: 'favorite_restaurants',
    timestamps: false
  });

  FavoriteRestaurant.associate = function(models) {
    FavoriteRestaurant.belongsTo(models.User, {
      foreignKey: 'UserId',
      targetKey: 'userId', // referência correta da tabela Users
      as: 'user'
    });

    FavoriteRestaurant.belongsTo(models.Restaurant, {
      foreignKey: 'RestaurantId',
      targetKey: 'restaurantId', // referência correta da tabela Restaurants
      as: 'restaurant'
    });
  };

  return FavoriteRestaurant;
};
