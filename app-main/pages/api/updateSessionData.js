// pages/api/updateSessionData.js
import { db } from '../../lib/firebaseAdmin';
import cookie from 'cookie';

export default async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const consentId = cookies.cookie_consent_id;

    if (!consentId) {
      return res.status(400).json({ error: 'Missing consentId in cookies' });
    }

    const { sessionData } = req.body;

    if (!sessionData) {
      return res.status(400).json({ error: 'Missing sessionData in request body' });
    }

    // Update the session document
    await db.collection('sessions').doc(consentId).set(sessionData, { merge: true });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating session data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
