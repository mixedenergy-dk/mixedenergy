// components/CookieConsent.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getOrCreateSessionRequest } from '../lib/session';
import { getCookie } from '../lib/cookies'; // Assuming you have your cookie helper here

interface GetSessionResponse {
  session: {
    allowCookies?: boolean;
  };
}

interface AcceptCookiesResponse {
  success: boolean;
}

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const [cookieError, setCookieError] = useState<boolean>(false);

  useEffect(() => {
    getOrCreateSessionRequest()
      .then((response: GetSessionResponse) => {
        if (!response.session.allowCookies) {
          setShow(true);
        }
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
        setCookieError(true);
      });
  }, []);

  const acceptCookies = async () => {
    try {
      const localSessionId = getCookie('session_id');
      if (!localSessionId) {
        console.error('No session_id cookie found. Please enable cookies.');
        return;
      }

      const response = await axios.post<AcceptCookiesResponse>(
        '/api/supabase/1-acceptCookies',
        { sessionId: localSessionId },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShow(false);
      }
    } catch (error) {
      console.error('Error updating cookie consent:', error);
    }
  };

  if (cookieError) {
    return (
      <div className="fixed top-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
        <p>
          For at kunne bruge denne hjemmeside, skal du tillade cookies. Venligst
          slå cookies til i din browserindstillinger, før du fortsætter.
        </p>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 text-white flex justify-between items-center">
      <p className="text-sm">
        Vi bruger cookies for at forbedre din oplevelse. Ved at fortsætte
        accepterer du vores brug af cookies.{' '}
        <a href="/cookiepolitik" className="underline ml-2">
          Læs mere
        </a>.
      </p>
      <div>
        <button
          onClick={acceptCookies}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Tillad alle cookies
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
