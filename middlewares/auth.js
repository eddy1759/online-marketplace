const httpStatus = require('http-status');
const { roleRights } = require('../config/roles');
const ApiError = require('../utils/ApiError');

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

const auth =
	(...requiredRights) =>
	async (req, res, next) => {
		return new Promise((resolve, reject) => {
			verifyCallback(req, resolve, reject, requiredRights)(req, res, next);
		})
			.then(() => next())
			.catch((err) => next(err));
	};

module.exports = auth;
