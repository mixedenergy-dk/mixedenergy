// components/Header.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBasket } from '../components/BasketContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTranslation } from 'next-i18next';

const Header = () => {
  const { basketItems, isNewItemAdded } = useBasket();
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const { t } = useTranslation('common');
  const currentLocale = router.locale || 'da';

  useEffect(() => {
    // Check if user is authenticated using API
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/checkAuth');
        if (response.data.loggedIn) {
          setIsLoggedIn(true);
          setUsername(response.data.email);
        } else {
          setIsLoggedIn(false);
          setUsername('');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        setUsername('');
      }
    };
    checkAuth();
  }, []);

  const handleLanguageToggle = (lang) => {
    if (lang !== currentLocale) {
      router.push(router.pathname, router.asPath, { locale: lang });
    }
  };

  const handleMouseEnter = () => {
    if (basketItems.length === 0) {
      setShowEmptyMessage(true);
    }
  };

  const handleMouseLeave = () => {
    setShowEmptyMessage(false);
  };

  const handleBasketClick = (e) => {
    if (basketItems.length === 0) {
      e.preventDefault();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/sessionLogout');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const totalItemsInBasket = basketItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header
      className="flex justify-between items-center p-4 shadow"
      style={{ backgroundColor: '#fab93d' }}
    >
      {/* Logo and Title */}
      <a href="/" className="flex items-center">
        <Image
          src="/images/mixedenergy-logo.png"
          alt="Logo"
          width={50}
          height={50}
        />
        <h1 className="text-3xl font-bold ml-2">Mixed Energy</h1>
      </a>

      {/* Language Toggle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleLanguageToggle('da')}
          className={`p-1 rounded ${currentLocale === 'da' ? 'border-2 border-blue-500' : ''}`}
        >
          <Image
            src="/images/flags/denmark-flag.svg"
            alt="Danish"
            width={24}
            height={24}
          />
        </button>
        <button
          onClick={() => handleLanguageToggle('en')}
          className={`p-1 rounded ${currentLocale === 'en' ? 'border-2 border-blue-500' : ''}`}
        >
          <Image
            src="/images/flags/usa-flag.svg"
            alt="English"
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Basket and Logout */}
      <div className="relative flex items-center space-x-4">
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <a href="/basket" onClick={handleBasketClick}>
            <img
              src="/icons/basket-icon.svg"
              alt="Basket Icon"
              width="45.76"
              height="46.782"
            />
            {basketItems.length > 0 && (
              <div
                className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold ${
                  isNewItemAdded ? 'animate-custom-pulse' : ''
                }`}
              >
                {totalItemsInBasket}
              </div>
            )}
          </a>
          {showEmptyMessage && (
            <div className="absolute top-full mt-1 -left-24 bg-black text-white text-xs rounded p-2 shadow-lg">
              {t('basket_empty')}
            </div>
          )}
        </div>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="bg-transparent border-2 border-black rounded px-4 py-1 hover:bg-black hover:text-white transition-all"
          >
            {t('logout')} {username}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
