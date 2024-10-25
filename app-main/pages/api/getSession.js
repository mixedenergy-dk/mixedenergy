// pages/api/getSession.js
import { db } from '../../lib/firebaseAdmin';
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    // Parse cookies from the request headers
    const cookies = cookie.parse(req.headers.cookie || '');
    const consentId = cookies.cookie_consent_id;

    if (!consentId) {
      return res.status(400).json({ error: 'Missing consentId in cookies' });
    }

    const docRef = db.collection('sessions').doc(consentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const data = docSnap.data();

    // Return the session data
    res.status(200).json({ session: data });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
