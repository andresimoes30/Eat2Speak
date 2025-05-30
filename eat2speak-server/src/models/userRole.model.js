module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    tableName: 'UserRole',
    timestamps: false
  });

  return UserRole;
};
