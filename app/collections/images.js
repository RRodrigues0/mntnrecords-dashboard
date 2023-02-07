const Images = {
	slug: 'images',
	access: {
		read: (function () { return true; })
	},
	admin: {
		useAsTitle: 'description',
		group: {
			en: 'Materials',
		},
	},
	fields: [
		{
			name: 'description',
			type: 'text',
			required: true,
		},
	],
	upload: {
		staticURL: '/uploads/images',
		staticDir: '../public/uploads/images',
		mimeTypes: ['image/*'],
		adminThumbnail: 'mobile',
		imageSizes: [
			{
				name: 'mobile',
				width: 400,
				height: null,
				position: 'centre',
			},
			{
				name: 'tablet',
				width: 992,
				height: null,
				position: 'centre',
			},
			{
				name: 'desktop',
				width: 2000,
				height: null,
				position: 'centre',
			},
		],
	}
};

export default Images;