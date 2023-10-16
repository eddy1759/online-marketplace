const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
const { dB } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { isEmail } = require('validator');
const 

/**
 * Checks if an email is already taken by a user in the database.
 * @async
 * @function
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the email is taken or not.
 */
const isEmailTaken = async (email) => {
	const user = await dB.users.findOne({ where: { email } });
	return !!user;
};

/**
 * Creates a new user in the database.
 * @param {Object} userBody - The user object to be created.
 * @param {string} userBody.email - The email of the user.
 * @param {string} userBody.password - The password of the user.
 * @returns {Promise<Object>} The newly created user object.
 * @throws {ApiError} If the email is already taken or there is a problem with account creation.
 */
const createUser = async (userBody) => {
	const { email, password } = userBody;

	if (!isEmail(email)) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email');
	}

	const emailTaken = await isEmailTaken(email);
	if (emailTaken) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	let transaction;
	try {
		transaction = await dB.sequelize.transaction();

		const user = await dB.users.create(
			{
				email,
				password_hash: hashedPassword,
			},
			{ transaction },
		);

		await transaction.commit();

		return user;
	} catch (error) {
		if (transaction) {
			await transaction.rollback();
		}

		logger.error(error);
		throw new ApiError(httpStatus.BAD_GATEWAY, 'Problem with account creation');
	}
};

/**
 * Makes a user an admin.
 * @async
 * @function
 * @param {Object} userInstance - The user instance to make an admin.
 * @returns {Promise<Object>} - The updated user object.
 */
const makeAdmin = async (userInstance) => {
	const user = await getUserById(userInstance.id);
	user.is_admin = 1;
	await user.save();
	return user;
};

/**
 * Retrieves a user object from the database by their ID.
 * @async
 * @function
 * @param {number} id - The ID of the user to retrieve.
 * @returns {Promise<object>} - A Promise that resolves with the user object.
 */
const getUserById = async (id) => {
	const person = await dB.users.findOne({ where: { id } });
	if (!person) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	return person;
};

/**
 * Update user by id
 * @param {string} userId - The id of the user to update
 * @param {Object} updateBody - The object containing the fields to update
 * @param {string[]} exclude - The fields to exclude from the update
 * @returns {Promise<Object>} The updated user object
 * @throws {ApiError} If user is not found
 */
const updateUserById = async (userId, updateBody, exclude) => {
	const { email } = updateBody;

	if (email && !isEmail(email)) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email');
	}

	const user = await getUserById(userId);

	if (email && email !== user.email) {
		const emailTaken = await isEmailTaken(email);
		if (emailTaken) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
		}
	}
	Object.assign(user, updateBody);

	await user.save();

	return {
		...user.toJSON(),
		createdAt: undefined,
		updatedAt: undefined,
		__v: undefined,
	};
};

module.exports = {
	createUser,
	makeAdmin,
	getUserById,
	updateUserById,
};
