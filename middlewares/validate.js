const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick.js');
const ApiError = require('../utils/ApiError.js/index.js');
const infologger = require('../config/logger.js');

/**
 * Validates the request object against a given schema using Joi.
 * @param {Object} schema - The Joi schema to validate against.
 * @returns {Function} - Express middleware function that validates the request object.
 */
const validate = (schema) => (req, res, next) => {
	const validSchema = pick(schema, ['params', 'query', 'body']);
	const object = pick(req, Object.keys(validSchema));
	const { value, error } = Joi.compile(validSchema)
		.prefs({
			errors: {
				label: 'key',
			},
			abortEarly: false,
		})
		.validate(object);

	if (error) {
		const body = {};
		const query = {};
		const errorMessage = {};
		error.details.map((details) => {
			switch (details.path[0]) {
				case 'body':
					body[details.path[1]] = details.message.replace(/"/g, "'");
					break;
				case 'query':
					query[details.path[1]] = details.message.replace(/"/g, "'");
					break;
				default:
					break;
			}
			infologger.info(details, 'Details Object');
		});
		Object.keys(body).length !== 0 && (errorMessage.body = body);
		Object.keys(query).length !== 0 && (errorMessage.query = query);
		return next(
			new ApiError(
				httpStatus.BAD_REQUEST,
				JSON.stringify(errorMessage),
				undefined,
				undefined,
				true,
			),
		);
	}
	Object.assign(req, value);
	return next();
};

module.exports = validate;
