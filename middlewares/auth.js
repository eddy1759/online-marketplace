const httpStatus = require('http-status');
const { roleRights } = require('../config/roles');
const ApiError = require('../utils/ApiError');
const tokenTypes = require('../config/token');
const tokenService = require('../services/token.service.js');

const verifyCallback = (req, resolve, reject, requiredRights) => {
	return async (err, user, info) => {
		if (err || info || !user) {
			reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
			return;
		}
		req.user = user;

		if (requiredRights.length) {
			const userRights = roleRights.get(user.role);
			const hasRequiredRights = requiredRights.every((requiredRight) =>
				userRights.includes(requiredRight),
			);

			if (!hasRequiredRights && req.params.userId !== user.id) {
				reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
				return;
			}
		}

		resolve();
	};
};

const auth = (...requiredRights) => {
	return async (req, res, next) => {
		try {
			const header = req.get('Authorization');
			if (header === undefined || header === null) {
				throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
			}
			const token = header.split(' ')[1];

			const decoded = await tokenService.verifyToken(
				token,
				tokenTypes.ACCESS_TOKEN,
			);

			if (decoded instanceof Error) {
				throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
			}
			const { user } = decoded;
			req.user = user;

			await verifyCallback(req, requiredRights);
			next();
		} catch (error) {
			next(error);
		}
	};
};

module.exports = auth;
