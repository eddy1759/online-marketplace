const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define(
		'User',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			password_hash: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			first_name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			last_name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			profile_picture: {
				type: DataTypes.STRING,
			},
			refresh_token: {
				type: DataTypes.STRING,
			},
			phone_number: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			is_admin: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			is_verified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			two_factor_auth: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'user',
			timestamps: false,
		},
	);

	User.beforeCreate(async (user) => {
		user.password_hash = await bcrypt.hash(user.password_hash, 10);
	});

	User.beforeUpdate(async (user) => {
		user.password_hash = await bcrypt.hash(user.password_hash, 10);
	});

	User.prototype.checkPassword = async function (password) {
		return await bcrypt.compare(password, this.password_hash);
	};

	return User;
};
