const Payout = {
	slug: 'payout',
	admin: {
		defaultColumns: ['requested', 'user', 'status'],
		disableDuplicate: true,
		group: {
			en: 'Library',
		},
	},
	fields: [
		{
			name: 'user',
			type: 'relationship',
			relationTo: 'users',
			required: true,
		},
		// {
		//     name: 'status',
		//     type: 'select',
		//     defaultValue: 'created',
		//     required: true,
		//     admin: {
		//         position: 'sidebar',
		//     },
		//     options: [
		//         { label: 'Created', value: 'created' },
		//         { label: 'Finished', value: 'done' },
		//     ],
		// }, 
		{
			name: 'requested',
			type: 'date',
			required: true,
			admin: {
				position: 'sidebar',
			},
			defaultValue: () => (new Date()),
		},
		{
			name: 'money',
			type: 'number',
			min: 0,
			defaultValue: 0,
			required: true,
		},
	]
}

export default Payout;
