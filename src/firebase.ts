import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';

dotenv.config();

const serviceAccount = JSON.parse(
  Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!, 'base64').toString('utf8'),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
