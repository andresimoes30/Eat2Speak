const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool,
  timezone: '+02:00', // horario de verano en España
  dialectOptions: {
    timezone: 'Etc/GMT-2'
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./user.model')(sequelize, DataTypes);
db.Role = require('./role.model')(sequelize, DataTypes);
db.UserRole = require('./userRole.model')(sequelize, DataTypes);
db.UserLanguage = require('./userLanguage.model')(sequelize, DataTypes);
db.Restaurant = require('./restaurant.model')(sequelize, DataTypes);
db.Menu = require('./menu.model')(sequelize, DataTypes);
db.Session = require('./session.model')(sequelize, DataTypes);
db.Payment = require('./payment.model')(sequelize, DataTypes);
db.Review = require('./review.model')(sequelize, DataTypes);

// Relationships
db.User.belongsToMany(db.Role, { through: db.UserRole, foreignKey: 'userId' });
db.Role.belongsToMany(db.User, { through: db.UserRole, foreignKey: 'roleId' });

db.User.hasMany(db.UserLanguage, { foreignKey: 'userId' });
db.UserLanguage.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Restaurant, { foreignKey: 'ownerUserId' });
db.Restaurant.belongsTo(db.User, { foreignKey: 'ownerUserId' });

db.Restaurant.hasMany(db.Menu, { foreignKey: 'restaurantId' });
db.Menu.belongsTo(db.Restaurant, { foreignKey: 'restaurantId' });

db.User.hasMany(db.Session, { foreignKey: 'learnerUserId', as: 'LearnerSessions' });
db.User.hasMany(db.Session, { foreignKey: 'nativeUserId', as: 'NativeSessions' });
db.Session.belongsTo(db.User, { foreignKey: 'learnerUserId', as: 'Learner' });
db.Session.belongsTo(db.User, { foreignKey: 'nativeUserId', as: 'Native' });

db.Restaurant.hasMany(db.Session, { foreignKey: 'restaurantId' });
db.Session.belongsTo(db.Restaurant, { foreignKey: 'restaurantId' });

db.Menu.hasMany(db.Session, { foreignKey: 'menuId' });
db.Session.belongsTo(db.Menu, { foreignKey: 'menuId' });

db.Session.hasOne(db.Payment, { foreignKey: 'sessionId' });
db.Payment.belongsTo(db.Session, { foreignKey: 'sessionId' });

db.User.hasMany(db.Review, { foreignKey: 'reviewerUserId', as: 'ReviewsGiven' });
db.User.hasMany(db.Review, { foreignKey: 'reviewedUserId', as: 'ReviewsReceived' });
db.Review.belongsTo(db.User, { foreignKey: 'reviewerUserId', as: 'Reviewer' });
db.Review.belongsTo(db.User, { foreignKey: 'reviewedUserId', as: 'Reviewed' });

db.Session.hasMany(db.Review, { foreignKey: 'sessionId' });
db.Review.belongsTo(db.Session, { foreignKey: 'sessionId' });

// Sync com banco remoto
db.sequelize.sync({ alter: true })
  .then(() => console.log('Tabelas sincronizadas com sucesso'))
  .catch(err => console.error('Erro ao sincronizar tabelas:', err));

module.exports = db;
