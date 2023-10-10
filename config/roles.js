const buyer = {
	permissions: [
		'createOrder',
		'editOrder',
		'deleteOrder',
		'addToCart',
		'removeFromCart',
		'viewOrders',
		'sendMessage',
	],
	roles: ['buyer'],
};

const seller = {
	permissions: [
		'createProduct',
		'editProduct',
		'viewOrders',
		'sendMessage',
		'fulfillOrder',
	],
	roles: ['seller'],
};

const admin = {
	permissions: ['manageUsers', 'approveProducts'],
	roles: ['admin'],
};

const superAdmin = {
	permissions: ['manageAdmins'],
	roles: ['superAdmin'],
};

const allRoles = [buyer, seller, admin, superAdmin];

const roles = allRoles.reduce((acc, role) => {
	return acc.concat(role.roles);
}, []);

const roleRights = new Map(
	allRoles.map((role) => [role.roles[0], role.permissions]),
);

module.exports = {
	roles,
	roleRights,
};
