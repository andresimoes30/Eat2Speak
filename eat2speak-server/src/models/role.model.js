module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    roleId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    tableName: 'Role',
    timestamps: false
  });

  return Role;
};
