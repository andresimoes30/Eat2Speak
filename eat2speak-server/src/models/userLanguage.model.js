module.exports = (sequelize, DataTypes) => {
  const UserLanguage = sequelize.define('UserLanguage', {
    userLanguageId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    languageName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    proficiencyLevel: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'),
      allowNull: false
    }
  }, {
    tableName: 'UserLanguage',
    timestamps: false
  });

  return UserLanguage;
};
