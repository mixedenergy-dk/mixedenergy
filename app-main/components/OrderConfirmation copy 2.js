// components/OrderConfirmation.js

import React, { useState } from 'react';
import LoadingButton from './LoadingButton';
import { getCookie } from '../lib/cookies';

const OrderConfirmation = ({
  customerDetails,
  deliveryOption,
  selectedPoint,
  updateDeliveryDetailsInBackend,
  totalPrice,
  totalRecyclingFee,
  basketItems,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Function to split address into streetName and streetNumber
  const splitAddress = (address) => {
    const regex = /^(.*?)(\s+\d+\S*)$/;
    const match = address.match(regex);
    if (match) {
      return {
        streetName: match[1].trim(),
        streetNumber: match[2].trim(),
      };
    } else {
      return {
        streetName: address,
        streetNumber: '',
      };
    }
  };

  const constructDeliveryAddress = () => {
    if (deliveryOption === 'pickupPoint') {
      // Use the selected pickup point details if available
      // For this example, we'll mock the data
      return {
        name: 'Valgt afhentningssted',
        streetName: 'Afhentningsvej',
        streetNumber: '123',
        postalCode: '2800',
        city: 'Kgs. Lyngby',
        country: 'Danmark',
      };
    } else if (deliveryOption === 'homeDelivery') {
      // Use customerDetails address
      const { streetName, streetNumber } = splitAddress(customerDetails.address || '');
      return {
        name: customerDetails.fullName,
        streetName: streetName,
        streetNumber: streetNumber,
        postalCode: customerDetails.postalCode,
        city: customerDetails.city,
        country: 'Danmark',
      };
    }
    return {};
  };

  const deliveryAddress = constructDeliveryAddress();

  const handlePayment = async () => {
    if (!termsAccepted) {
      setTermsError(
        'Du skal acceptere vores forretningsvilkår før du kan fortsætte, sæt flueben i boksen herover.'
      );
      // Scroll to terms section
      document.getElementById('order-confirmation').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const cookieConsentId = getCookie('cookie_consent_id');

      // Step 1: Create Order
      const orderResponse = await fetch('/api/firebase/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieConsentId, deliveryAddress, customerDetails }),
      });

      const { orderId } = await orderResponse.json();

      // Step 2: Create Payment
      const paymentResponse = await fetch('/api/firebase/createPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, totalPrice }),
      });

      const paymentData = await paymentResponse.json();

      if (paymentData.url) {
        // Redirect to Quickpay payment link
        window.location.href = paymentData.url;
      } else {
        // Handle error
        console.error('Error initiating payment:', paymentData);
        alert('Der opstod en fejl under betalingsprocessen. Prøv igen senere.');
      }
    } catch (error) {
      console.error('Error during payment process:', error);
      alert('Der opstod en fejl under betalingsprocessen. Prøv igen senere.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div id="order-confirmation">
      <h2 className="text-2xl font-bold mb-4">Bekræft Ordre</h2>
      {/* Order Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Ordreoversigt</h3>
        {/* Display the summary */}
        <div className="mb-4">
          <h4 className="font-bold">Leveringstype:</h4>
          <p>{deliveryOption === 'pickupPoint' ? 'Afhentningssted' : 'Hjemmelevering'}</p>
        </div>
        <div className="mb-4">
          <h4 className="font-bold">Leveringsadresse:</h4>
          <p>{deliveryAddress.name || ''}</p>
          <p>
            {deliveryAddress.streetName || ''} {deliveryAddress.streetNumber || ''}
          </p>
          <p>
            {deliveryAddress.postalCode || ''} {deliveryAddress.city || ''}
          </p>
          <p>{deliveryAddress.country || ''}</p>
        </div>
        <div className="mb-4">
          <h4 className="font-bold">Kundeoplysninger:</h4>
          <p>Navn: {customerDetails.fullName}</p>
          <p>Email: {customerDetails.email}</p>
          <p>Telefon: {customerDetails.mobileNumber}</p>
        </div>
        <div className="mb-4">
          <h4 className="font-bold">Ordre Detaljer:</h4>
          <p>Antal pakker: {basketItems.reduce((acc, item) => acc + item.quantity, 0)}</p>
          <p>Total pris: {(totalPrice / 100).toFixed(2)} kr</p>
          <p>Total pant: {(totalRecyclingFee / 100).toFixed(2)} kr</p>
          <p>
            Leveringsgebyr: {deliveryOption === 'pickupPoint' ? 'Gratis' : 'Vil blive beregnet'}
          </p>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              setTermsError('');
            }}
          />
          <span className="ml-2">
            Jeg accepterer{' '}
            <a href="/handelsbetingelser" target="_blank" className="text-blue-500 underline">
              handelsbetingelserne
            </a>
          </span>
        </label>
        {termsError && <p className="text-red-600">{termsError}</p>}
      </div>

      <div className="mt-8 flex justify-center">
        <LoadingButton
          onClick={handlePayment}
          loading={isProcessingPayment}
          className="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-green-600 transition"
        >
          Gå til betaling
        </LoadingButton>
      </div>
    </div>
  );
};

export default OrderConfirmation;
