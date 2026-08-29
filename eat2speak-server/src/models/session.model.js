module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sessionId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId'
      }
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Sessions',
    timestamps: false,
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['userId']
      },
      {
        name: 'idx_token',
        fields: ['token']
      },
      {
        name: 'idx_is_active',
        fields: ['isActive']
      }
    ]
  });

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User'
    });
  };

  return Session;
};