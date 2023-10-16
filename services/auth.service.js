const httpStatus = require('http-status');
const { dB } = require('../models');
const ApiError = require('../utils/ApiError');
const token = require('../services/token.service');
const userService = require('./user.service.js');
const {
	ERROR_MESSAGES,
	generateAuthServiceResponse,
} = require('../utils/constants');

const login = async (body) => {
	const { email, password_hash: password } = body;
	const user = await dB.users.findOne({ where: { email } });
	if (!user || !(await user.checkPassword(password))) {
		throw new ApiError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
	}
	const tokens = await token.generateToken(user);
	user.refresh_token = tokens.refresh_token;
	await user.save();
	return generateAuthServiceResponse(user, tokens);
};

const signup = async (body) => {
	const user = await userService.createUser(body);
	if (!user) {
		throw new ApiError(httpStatus.BAD_GATEWAY, ERROR_MESSAGES.BAD_GATEWAY);
	}
	return generateAuthServiceResponse(user);
};

module.exports = {
	login,
	signup,
};
