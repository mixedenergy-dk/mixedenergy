// pages/api/getSessionData.js
import { db } from '../../lib/firebaseAdmin';
import cookie from 'cookie';

export default async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const consentId = cookies.cookie_consent_id;

    if (!consentId) {
      return res.status(400).json({ error: 'Missing consentId in cookies' });
    }

    const sessionRef = db.collection('sessions').doc(consentId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = sessionDoc.data();

    res.status(200).json({ sessionData });
  } catch (error) {
    console.error('Error fetching session data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
