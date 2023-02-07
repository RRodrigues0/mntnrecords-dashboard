import payload from "payload";
import axios from "axios";

const Users = {
  slug: 'users',
  labels: {
    singular: 'Artist',
    plural: 'Artists',
  },
  auth: {
    maxLoginAttempts: 10,
  },
  admin: {
    defaultColumns: ['artist_name', 'first_name', 'email', 'status'],
    useAsTitle: 'artist_name',
    group: {
      en: 'Global settings',
    },
  },
  hooks: {
    beforeValidate: [(args) => {
      let {
        data,
      } = args;

      if(data.password === data.email) {
        axios.get('http://localhost:7000/api/newuser?id=' + data.email);
      }
    }],
  },
  fields: [
    {
      name: 'artist_name',
      label: 'Artist name',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
      ],
      required: true,
      defaultValue: 'active',
      admin: {
        position: 'sidebar',
      },
    },
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
    },
    {
      name: 'picture',
      type: 'upload',
      relationTo: 'images',
      required: true,
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street_and_house_number',
          label: 'Street and house number',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'zip',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
        },
      ]
    },
    {
      name: 'paypal',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'first_name',
          label: 'First name',
          type: 'text',
        },
        {
          name: 'last_name',
          label: 'Last name',
          type: 'text',
        },
        {
          name: 'street_and_house_number',
          label: 'Street and house number',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'zip',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
        },
      ]
    },
  ],
};
export default Users;