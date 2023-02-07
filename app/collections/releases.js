const Releases = {
	slug: 'releases',
	versions: {
		maxPerDoc: 100,
		drafts: false
	},
	admin: {
		defaultColumns: ['release_title', 'release_date', 'remaining'],
		useAsTitle: 'release_title',
		group: {
			en: 'Library',
		},
	},
	fields: [
		{
			name: 'release_title',
			label: 'Release title',
			type: 'text',
			required: true,
		},
		{
			name: 'release_date',
			label: 'Release date',
			type: 'date',
			required: true,
			admin: {
				date: {
					displayFormat: 'MM/d/yyyy'
				},
			},
		},
		{
			name: 'barcode',
			type: 'number',
			min: 0,
			defaultValue: 0,
			admin: {
				hidden: true
			}
		},
		{
			name: 'downloads',
			type: 'group',
			admin: {
				hidden: true
			},
			fields: [
				{
					name: 'value',
					type: 'number',
					min: 0,
					defaultValue: 0,
				},
				{
					name: 'revenue',
					type: 'number',
					min: 0,
					defaultValue: 0,
				},
			]
		},
		{
			name: 'streams',
			type: 'group',
			admin: {
				hidden: true
			},
			fields: [
				{
					name: 'value',
					type: 'number',
					min: 0,
					defaultValue: 0,
				},
				{
					name: 'revenue',
					type: 'number',
					min: 0,
					defaultValue: 0,
				},
			]
		},
		{
			name: 'mntnrecords',
			label: 'MNTN Records',
			type: 'group',
			required: true,
			fields: [
				{
					name: 'percent',
					type: 'number',
					min: 0,
					max: 100,
					defaultValue: 50,
					required: true,
				},
				{
					name: 'reserved',
					type: 'number',
					min: 0,
					defaultValue: 50,
					required: true,
				},
				{
					name: 'total',
					type: 'number',
					min: 0,
					defaultValue: 0,
					admin: {
						readOnly: true
					}
				},
				{
					name: 'remaining',
					type: 'number',
					min: 0,
					defaultValue: 0,
				}
			]
		},
		{
			name: 'artists',
			type: 'array',
			required: true,
			fields: [
				{
					name: 'user',
					type: 'relationship',
					relationTo: 'users',
					required: true,
				},
				{
					name: 'percent',
					type: 'number',
					min: 0,
					max: 100,
					defaultValue: 0,
					required: true,
				},
				{
					name: 'total',
					type: 'number',
					min: 0,
					defaultValue: 0,
					admin: {
						readOnly: true
					}
				},
				{
					name: 'remaining',
					type: 'number',
					min: 0,
					defaultValue: 0,
				}
			]
		},
		{
			name: 'monthAt',
			type: 'date',
			admin: {
				hidden: true
			}
		},
	],
}

export default Releases;