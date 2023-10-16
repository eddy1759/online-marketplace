const ERROR_MESSAGES = {
	UNAUTHORIZED: 'Incorrect email or password',
	BAD_GATEWAY: 'User was not created',
	EMAIL_TAKEN: 'Email is already taken',
	INVALID_EMAIL: 'Invalid email',
	USER_NOT_FOUND: 'User not found',
};

const generateAuthServiceResponse = (user, tokens) => {
	const { password_hash, refresh_token, __v, ...userData } = user.dataValues;
	return {
		user: userData,
		tokens,
	};
};

mpdule.exports = {
	ERROR_MESSAGES,
	generateAuthServiceResponse,
};
