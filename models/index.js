const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/auth');
const logger = require('../config/logger');

const sequelizeInstance = new Sequelize(sequelize.url);

sequelizeInstance
	.authenticate()
	.then(() => {
		logger.info('Database Connected Successfully');
	})
	.catch((err) => {
		logger.error('Database Connection Failed', err);
	});

const dB = {};

dB.Sequelize = Sequelize;

dB.users = require('./user')(sequelizeInstance, Sequelize);

module.exports = {
	dB,
};
