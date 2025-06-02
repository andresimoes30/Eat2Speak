module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    menuId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    menuCode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    }
  }, {
    tableName: 'Menu',
    timestamps: false
  });

  return Menu;
};
