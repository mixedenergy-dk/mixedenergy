import React, { FC, useMemo, useState } from 'react';
import LoadingButton from './LoadingButton';
import { useRouter } from 'next/router';
import { useBasket } from './BasketContext';

export interface ICustomerDetails {
  fullName: string;
  mobileNumber: string;
  email: string;
  address?: string;
  postalCode?: string;
  city?: string;
  [key: string]: any;
}

export interface IDeliveryAddress {
  name?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  [key: string]: any;
}

export interface IBasketItem {
  quantity: number;
  totalPrice?: number;
  totalRecyclingFee?: number;
}

export interface IBasketSummary {
  deliveryDetails?: {
    deliveryAddress?: IDeliveryAddress;
    deliveryFee?: number; // in "øre"
  };
}

interface ErrorMap {
  [field: string]: string;
}

interface TouchedFieldsMap {
  [field: string]: boolean;
}

interface OrderConfirmationProps {
  customerDetails: ICustomerDetails;
  deliveryOption: string;
  selectedPoint: any;
  updateDeliveryDetailsInBackend: (
    deliveryOption: string,
    extras?: { selectedPickupPoint?: any }
  ) => Promise<void>;
  totalPrice: number;
  totalRecyclingFee: number;
  basketItems: IBasketItem[];
  basketSummary?: IBasketSummary | null;
  errors: ErrorMap;
  setErrors: React.Dispatch<React.SetStateAction<ErrorMap>>;
  touchedFields: TouchedFieldsMap;
  setTouchedFields: React.Dispatch<React.SetStateAction<TouchedFieldsMap>>;
  submitAttempted: boolean;
  setSubmitAttempted: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * OrderConfirmation
 * - Shows a live “Ordreoversigt” (delivery address, etc.)
 * - Lets user confirm and proceed to payment.
 */
const OrderConfirmation: FC<OrderConfirmationProps> = ({
  customerDetails,
  deliveryOption,
  selectedPoint,
  updateDeliveryDetailsInBackend,
  totalPrice,
  totalRecyclingFee,
  basketItems,
  basketSummary,
  errors,
  setErrors,
  touchedFields,
  setTouchedFields,
  submitAttempted,
  setSubmitAttempted,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const router = useRouter();
  const basketContext = useBasket();

  /**
   * Helper for splitting "Vinkelvej 12D, 3tv" into
   * { streetName: 'Vinkelvej 12D,', streetNumber: '3tv' }
   */
  const splitAddress = (address: string) => {
    const regex = /^(.*?)(\s+\d+\S*)$/;
    const match = address.match(regex);
    if (match) {
      return {
        streetName: match[1].trim(),
        streetNumber: match[2].trim(),
      };
    }
    return { streetName: address, streetNumber: '' };
  };

  /**
   * Compute the displayed deliveryAddress from local data so that
   * the UI is always up to date.
   */
  const computedDeliveryAddress = useMemo(() => {
    if (deliveryOption === 'pickupPoint' && selectedPoint) {
      // If we store the full selectedPoint object, build an address from it
      return {
        name: selectedPoint.name || '',
        streetName: selectedPoint?.visitingAddress?.streetName || '',
        streetNumber: selectedPoint?.visitingAddress?.streetNumber || '',
        postalCode: selectedPoint?.visitingAddress?.postalCode || '',
        city: selectedPoint?.visitingAddress?.city || '',
        country: 'Danmark',
      };
    } else if (deliveryOption === 'homeDelivery') {
      const { streetName, streetNumber } = splitAddress(customerDetails.address || '');
      return {
        name: customerDetails.fullName || '',
        streetName,
        streetNumber,
        postalCode: customerDetails.postalCode || '',
        city: customerDetails.city || '',
        country: 'Danmark',
      };
    } else {
      // If no selection, or user hasn't picked a point
      return {};
    }
  }, [deliveryOption, selectedPoint, customerDetails]);

  /**
   * Handle "Betal" or "Gennemfør køb" logic
   */
  const handlePayment = async () => {
    setSubmitAttempted(true);

    // Validate required customer details
    const requiredFields = ['fullName', 'mobileNumber', 'email', 'address', 'postalCode', 'city'];
    const newErrors: ErrorMap = { ...errors };
    const newTouchedFields: TouchedFieldsMap = { ...touchedFields };

    let customerDetailsValid = true;
    for (const field of requiredFields) {
      // @ts-ignore
      if (!customerDetails[field] || !customerDetails[field].trim()) {
        newErrors[field] = 'Dette felt er påkrævet';
        newTouchedFields[field] = true;
        customerDetailsValid = false;
      }
    }

    setErrors(newErrors);
    setTouchedFields(newTouchedFields);

    if (!customerDetailsValid) {
      document.getElementById('customer-details')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // If pickupPoint is chosen but none is selected
    if (deliveryOption === 'pickupPoint' && !selectedPoint) {
      document.getElementById('shipping-and-payment')?.scrollIntoView({ behavior: 'smooth' });
      alert('Vælg venligst et afhentningssted.');
      return;
    }

    // If homeDelivery, ensure we have valid address fields
    if (deliveryOption === 'homeDelivery') {
      const requiredDeliveryFields = ['name', 'streetName', 'postalCode', 'city', 'country'];
      const deliveryValid = requiredDeliveryFields.every((field) =>
        // @ts-ignore
        computedDeliveryAddress[field]?.toString().trim()
      );
      if (!deliveryValid) {
        document.getElementById('customer-details')?.scrollIntoView({ behavior: 'smooth' });
        alert('Udfyld venligst alle leveringsdetaljer.');
        return;
      }
    }

    // Check if basket is empty
    if (!basketItems || basketItems.length === 0) {
      router.push('/');
      return;
    }

    // Check terms acceptance
    if (!termsAccepted) {
      setTermsError(
        'Du skal acceptere vores handelsbetingelser før du kan fortsætte. Sæt venligst flueben i boksen herover.'
      );
      document.getElementById('order-confirmation')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Proceed with payment
    setIsProcessingPayment(true);
    try {
      // 1) Update the server's delivery details so basketSummary is synced
      await updateDeliveryDetailsInBackend(deliveryOption, {
        selectedPickupPoint: selectedPoint,
      });

      // 2) Create the Order and initiate payment
      const response = await fetch('/api/firebase/6-createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error('Payment link not received');
      }
    } catch (error) {
      console.error('Error during payment process:', error);
      alert('Der opstod en fejl under betalingsprocessen. Prøv igen senere.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // -- Render --
  return (
    <div id="order-confirmation">
      <h2 className="text-2xl font-bold mb-4">Bekræft Ordre</h2>

      {/* Ordreoversigt */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Ordreoversigt</h3>

        <div className="mb-4">
          <h4 className="font-bold">Leveringstype:</h4>
          <p>{deliveryOption === 'pickupPoint' ? 'Afhentningssted' : 'Hjemmelevering'}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-bold">Leveringsadresse:</h4>
          <p>{computedDeliveryAddress.name || ''}</p>
          <p>
            {computedDeliveryAddress.streetName || ''}{' '}
            {computedDeliveryAddress.streetNumber || ''}
          </p>
          <p>
            {computedDeliveryAddress.postalCode || ''}{' '}
            {computedDeliveryAddress.city || ''}
          </p>
          <p>{computedDeliveryAddress.country || ''}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-bold">Kundeoplysninger:</h4>
          <p>Navn: {customerDetails.fullName}</p>
          <p>Email: {customerDetails.email}</p>
          <p>Telefon: {customerDetails.mobileNumber}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-bold">Ordre Detaljer:</h4>
          <p>
            Antal pakker: {basketItems.reduce((acc, item) => acc + item.quantity, 0)}
          </p>
          <p>Total pris: {((totalPrice + totalRecyclingFee) / 100).toFixed(2)} kr</p>
          <p>Pant: {(totalRecyclingFee / 100).toFixed(2)} kr</p>
          <p>
            Leveringsgebyr:{' '}
            {basketSummary?.deliveryDetails?.deliveryFee
              ? (basketSummary.deliveryDetails.deliveryFee / 100).toFixed(2) + ' kr'
              : 'Gratis'}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-lg font-semibold">I alt at betale inkl. moms</div>
        <h3 className="text-2xl font-bold">
          {(
            (totalPrice +
              totalRecyclingFee +
              (basketSummary?.deliveryDetails?.deliveryFee || 0)) /
            100
          ).toFixed(2)}{' '}
          kr.
        </h3>
      </div>

      <div className="mt-4 flex justify-center">
        <label className="flex items-center">
          <input
            required
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              setTermsError('');
            }}
            className="mr-2"
          />
          <span>
            Jeg har læst og accepteret{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
              href="/handelsbetingelser"
            >
              handelsbetingelser
            </a>
            .
          </span>
        </label>
      </div>
      {termsError && <p className="text-red-600 text-center mt-2">{termsError}</p>}

      <div className="mt-8 flex justify-center">
        <LoadingButton
          onClick={handlePayment}
          loading={isProcessingPayment}
          className="bg-customYellow text-white px-6 py-2 rounded-full shadow hover:bg-customOrange transition"
        >
          GENNEMFØR KØB
        </LoadingButton>
      </div>
    </div>
  );
};

export default OrderConfirmation;
