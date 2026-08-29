module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    reviewId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reviewerUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reviewedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reviewedType: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'Review',
    timestamps: false
  });

  return Review;
};
