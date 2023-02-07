import addRelease from '../hooks/addRelease';

const Files = {
	slug: 'files',
	admin: {
		group: {
			en: 'Materials',
		},
	},
	upload: {
		staticURL: '/uploads/files',
		staticDir: '../public/uploads/files',
		mimeTypes: ['text/csv']
	}
};


export default Files;