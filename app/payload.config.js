import { buildConfig } from 'payload/config';

import Admins from './collections/admins';
import Users from './collections/users';
import Images from './collections/images';
import Files from "./collections/files";
import Releases from "./collections/releases";
import Invoice from "./collections/invoice";
import Payout from "./collections/payout";

export default buildConfig({
  serverURL: 'https://dashboard.mntnrecords.com',
  admin: {
    user: Admins.slug,
  },
  collections: [
    Users,
    Admins,
    Images,
    Files,
    Releases,
    Invoice,
    Payout
  ],
  upload: {
    limits: {
      fileSize: 5000000,
    }
  }
});
