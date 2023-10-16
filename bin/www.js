const http = require('http');
const app = require('../app');
const config = require('../config/auth');
const logger = require('../config/logger');

const server = http.createServer(app);
var port;
const startServer = () => {
	port = normalizePort(config.port);
	app.set('port', port);

	server.listen(port, () => {
		logger.info(`Listening to port ${port}`);
	});

	server.on('error', onError);
	server.on('listening', onListening);

	process.on('SIGTERM', () => {
		logger.info('SIGTERM received. Closing the server...');
		server.close(() => {
			logger.info('Server closed');
			process.exit(0);
		});
	});
};

const unexpectedErrorHandler = (error) => {
	logger.error(error);
	process.exit(1);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

/**
 * Function to Normalize a port into a number.
 * @param {string} val - The port number.
 * @returns {number} The port number.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		return val;
	}

	if (port >= 0) {
		return port;
	}

	return false;
}

/**
 * Function to handle error.
 * @param {object} error - The error object.
 */
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

	switch (error.code) {
		case 'EACCES':
			logger.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			logger.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Function to handle listening event.
 */
function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string' ? `Pipe ${addr}` : `Port ${addr.port}`;
	logger.info(`Listening on ${bind}`);
}

startServer();

module.exports = {
	server,
};
