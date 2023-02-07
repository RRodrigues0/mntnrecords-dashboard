const Admins = {
	slug: 'admins',
	auth: {
		maxLoginAttempts: 10,
	},
	labels: {
		singular: 'Admin',
		plural: 'Admins',
	},
	admin: {
		defaultColumns: ['first_name', 'email'],
		useAsTitle: 'first_name',
		group: {
			en: 'Global settings',
		},
	},
	fields: [
		{
			name: 'first_name',
			label: 'First name',
			type: 'text',
			required: true,
		},
		{
			name: 'last_name',
			label: 'Last name',
			type: 'text',
			required: true,
		}
	],
};

export default Admins;