const axios = require('axios');

const Invoice = {
	slug: 'invoice',
	admin: {
		defaultColumns: ['month'],
		useAsTitle: 'month',
		group: {
			en: 'Library',
		},
	},
	fields: [
		{
			name: 'month',
			type: 'date',
			required: true,
			admin: {
				date: {
					pickerAppearance: 'monthOnly',
					displayFormat: 'MM/yyyy'
				}
			}
		},
		{
			name: 'excel_file',
			label: 'Excel file',
			type: 'upload',
			relationTo: 'files',
			required: true,
			hooks: {
				beforeValidate: [
					(args) => {
						let {
							data,
						} = args;

						axios.get('http://localhost:7000/api/addrelease?id=' + data.excel_file);
					}
				]
			}
		},
	],
}

export default Invoice;