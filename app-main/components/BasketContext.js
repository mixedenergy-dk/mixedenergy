// components/BasketContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getCookie } from '../lib/cookies';

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    customerType: 'Privat',
    fullName: '',
    mobileNumber: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Danmark',
    streetNumber: '',
  });
  const [isNewItemAdded, setIsNewItemAdded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const res = await fetch('/api/getSessionData');
        const data = await res.json();
        if (res.ok) {
          if (data.sessionData.currentStep) {
            setCurrentStep(data.sessionData.currentStep);
          }
          if (data.sessionData.customerDetails) {
            updateCustomerDetails(data.sessionData.customerDetails);
          }
        } else {
          console.error('Error fetching session data:', data.error);
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    };
  
    fetchSessionData();
  }, [dataLoaded]);


  useEffect(() => {
    const updateSessionData = async () => {
      try {
        await fetch('/api/updateSessionData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionData: { currentStep } }),
        });
      } catch (error) {
        console.error('Error updating session data:', error);
      }
    };
  
    updateSessionData();
  }, []);


  useEffect(() => {
    const updateSessionData = async () => {
      try {
        await fetch('/api/updateSessionData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionData: { customerDetails } }),
        });
      } catch (error) {
        console.error('Error updating session data:', error);
      }
    };
  
    updateSessionData();
  }, [customerDetails]);

  // Helper function to compare selected products
  const isSameSelection = (a, b) => {
    const aEntries = Object.entries(a).sort();
    const bEntries = Object.entries(b).sort();
    return JSON.stringify(aEntries) === JSON.stringify(bEntries);
  };

  const addItemToBasket = async (item) => {
    const existingItemIndex = basketItems.findIndex(
      (basketItem) =>
        basketItem.slug === item.slug &&
        basketItem.selectedSize === item.selectedSize &&
        isSameSelection(basketItem.selectedProducts, item.selectedProducts)
    );

    let updatedBasket;

    if (existingItemIndex >= 0) {
      updatedBasket = basketItems.map((basketItem, index) =>
        index === existingItemIndex
          ? { ...basketItem, quantity: basketItem.quantity + item.quantity }
          : basketItem
      );
    } else {
      updatedBasket = [...basketItems, item];
    }

    setBasketItems(updatedBasket);
    setIsNewItemAdded(true);

    // Update the basket on the server
    try {
      const consentId = getCookie('cookie_consent_id');
      const response = await axios.post('/api/updateBasket', {
        consentId,
        basketItems: updatedBasket,
      });
      if (!response.data.success) {
        console.error('Failed to update basket:', response.data);
      }
    } catch (error) {
      console.error('Error updating basket:', error);
    }
  };

  const removeItemFromBasket = async (index) => {
    const updatedBasket = basketItems.filter((_, i) => i !== index);
    setBasketItems(updatedBasket);

    // Update the basket on the server
    try {
      const consentId = getCookie('cookie_consent_id');
      const response = await axios.post('/api/updateBasket', {
        consentId,
        basketItems: updatedBasket,
      });
      if (!response.data.success) {
        console.error('Failed to update basket:', response.data);
      }
    } catch (error) {
      console.error('Error updating basket:', error);
    }
  };

  const updateItemQuantity = async (index, newQuantity) => {
    if (newQuantity < 1) {
      return; // Do nothing if quantity is less than 1
    } else {
      const updatedBasket = basketItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      );
      setBasketItems(updatedBasket);

      // Update the basket on the server
      try {
        const consentId = getCookie('cookie_consent_id');
        const response = await axios.post('/api/updateBasket', {
          consentId,
          basketItems: updatedBasket,
        });
        if (!response.data.success) {
          console.error('Failed to update basket:', response.data);
        }
      } catch (error) {
        console.error('Error updating basket:', error);
      }
    }
  };

  const updateCustomerDetails = async (updatedDetails) => {
    setCustomerDetails(updatedDetails);

    // Update customer details on the server
    try {
      const consentId = getCookie('cookie_consent_id');
      const response = await axios.post('/api/updateCustomerDetails', {
        consentId,
        customerDetails: updatedDetails,
      });
      if (!response.data.success) {
        console.error('Failed to update customer details:', response.data);
      }
    } catch (error) {
      console.error('Error updating customer details:', error);
    }
  };

  return (
    <BasketContext.Provider
      value={{
        basketItems,
        addItemToBasket,
        removeItemFromBasket,
        setBasketItems,
        customerDetails,
        updateCustomerDetails,
        isNewItemAdded,
        setIsNewItemAdded,
        updateItemQuantity,
        dataLoaded, // Add this line
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);
