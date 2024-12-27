// pages/basket.js

import { useState, useEffect } from 'react';
import router from 'next/router';
import { useBasket } from '../components/BasketContext';
import Loading from '../components/Loading';
import CustomerDetails from '../components/CustomerDetails';
import ShippingAndPayment from '../components/ShippingAndPayment';
import OrderConfirmation from '../components/OrderConfirmation';
import BasketItems from '../components/BasketItems';

export default function Basket() {
  const {
    basketItems,
    removeItemFromBasket,
    updateItemQuantity,
    customerDetails,
    updateCustomerDetails,
    isBasketLoaded,
  } = useBasket();

  const [packagesData, setPackagesData] = useState({});
  const [explodedItems, setExplodedItems] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [drinksData, setDrinksData] = useState({});
  const [deliveryOption, setDeliveryOption] = useState('pickupPoint');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [basketSummary, setBasketSummary] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const totalPrice = basketItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalRecyclingFee = basketItems.reduce((sum, item) => sum + item.totalRecyclingFee, 0);

  const updateDeliveryDetailsInBackend = async (option, deliveryData) => {
    try {
      let deliveryAddress = {};
      let providerDetails = {};

      if (option === 'pickupPoint') {
        const selectedPickupPoint = deliveryData.selectedPickupPoint;
        if (selectedPickupPoint) {
          deliveryAddress = {
            name: selectedPickupPoint.name,
            streetName: selectedPickupPoint.visitingAddress.streetName,
            streetNumber: selectedPickupPoint.visitingAddress.streetNumber,
            postalCode: selectedPickupPoint.visitingAddress.postalCode,
            city: selectedPickupPoint.visitingAddress.city,
            country: 'Danmark',
          };
          providerDetails = {
            postnord: {
              servicePointId: selectedPickupPoint.servicePointId,
              deliveryMethod: 'pickupPoint',
            },
          };
        }
      } else if (option === 'homeDelivery') {
        if (
          customerDetails.fullName &&
          customerDetails.address &&
          customerDetails.postalCode &&
          customerDetails.city
        ) {
          deliveryAddress = {
            name: customerDetails.fullName,
            streetName: customerDetails.address,
            streetNumber: '',
            postalCode: customerDetails.postalCode,
            city: customerDetails.city,
            country: 'Danmark',
          };
          providerDetails = {
            postnord: {
              servicePointId: null,
              deliveryMethod: 'homeDelivery',
            },
          };
        }
      }

      await fetch('/api/firebase/4-updateBasket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateDeliveryDetails',
          deliveryOption: option,
          deliveryAddress,
          providerDetails,
        }),
      });

      await fetchBasketSummary();
    } catch (error) {
      console.error('Error updating delivery details:', error);
    }
  };

  const removeItem = (itemIndex) => {
    removeItemFromBasket(itemIndex);
  };

  const updateQuantity = (itemIndex, newQuantity) => {
    updateItemQuantity(itemIndex, newQuantity);
  };

  const triggerExplosion = (itemIndex) => {
    setExplodedItems((prev) => ({
      ...prev,
      [itemIndex]: true,
    }));
  };

  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const packageSlugsSet = new Set();
    basketItems.forEach((item) => {
      if (item.slug) {
        packageSlugsSet.add(item.slug);
      }
    });
    const packageSlugs = Array.from(packageSlugsSet);

    if (packageSlugs.length > 0) {
      fetch('/api/firebase/2-getPackages')
        .then((res) => res.json())
        .then((data) => {
          const packages = data.packages;
          const packagesBySlug = {};
          packages.forEach((pkg) => {
            if (packageSlugs.includes(pkg.slug)) {
              packagesBySlug[pkg.slug] = pkg;
            }
          });
          setPackagesData(packagesBySlug);
        })
        .catch((error) => {
          console.error('Error fetching packages data:', error);
        });
    }
  }, [basketItems]);

  useEffect(() => {
    if (isBasketLoaded && basketItems.length === 0) {
      router.push('/');
    }
  }, [isBasketLoaded, basketItems, router]);

  useEffect(() => {
    const drinkSlugsSet = new Set();
    basketItems.forEach((item) => {
      if (item.selectedDrinks) {
        Object.keys(item.selectedDrinks).forEach((slug) => {
          drinkSlugsSet.add(slug);
        });
      }
    });
    const drinkSlugs = Array.from(drinkSlugsSet);

    if (drinkSlugs.length > 0) {
      fetch('/api/firebase/3-getDrinksBySlugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: drinkSlugs }),
      })
        .then((res) => res.json())
        .then((data) => {
          setDrinksData(data.drinks);
        })
        .catch((error) => {
          console.error('Error fetching drinks data:', error);
        });
    }
  }, [basketItems]);

  const fetchBasketSummary = async () => {
    try {
      const res = await fetch('/api/firebase/5-getBasket');
      const data = await res.json();
      setBasketSummary(data.basketDetails);
      if (data.basketDetails.deliveryDetails.deliveryType) {
        setDeliveryOption(data.basketDetails.deliveryDetails.deliveryType);
      }
      if (data.basketDetails.deliveryDetails.providerDetails?.postnord?.servicePointId) {
        setSelectedPoint(data.basketDetails.deliveryDetails.providerDetails.postnord.servicePointId);
      }
    } catch (error) {
      console.error('Error fetching basket summary:', error);
    }
  };

  useEffect(() => {
    fetchBasketSummary();
  }, [customerDetails, deliveryOption]);

  useEffect(() => {
    if (basketItems.length > 0) {
      if (
        deliveryOption === 'pickupPoint' &&
        basketSummary?.deliveryDetails?.providerDetails?.postnord?.servicePointId
      ) {
        const selectedPickupPoint = {
          name: basketSummary.deliveryDetails.deliveryAddress.name,
          visitingAddress: {
            streetName: basketSummary.deliveryDetails.deliveryAddress.streetName,
            streetNumber: basketSummary.deliveryDetails.deliveryAddress.streetNumber,
            postalCode: basketSummary.deliveryDetails.deliveryAddress.postalCode,
            city: basketSummary.deliveryDetails.deliveryAddress.city,
          },
          servicePointId: basketSummary.deliveryDetails.providerDetails.postnord.servicePointId,
        };
        updateDeliveryDetailsInBackend('pickupPoint', { selectedPickupPoint });
      } else if (deliveryOption === 'homeDelivery') {
        if (
          customerDetails.fullName &&
          customerDetails.address &&
          customerDetails.postalCode &&
          customerDetails.city
        ) {
          updateDeliveryDetailsInBackend('homeDelivery', {});
        }
      }
    }
  }, [basketItems, deliveryOption, basketSummary, customerDetails]);

  if (!isBasketLoaded) {
    return <Loading />;
  }

  return (
    <div className="p-8 w-full max-w-screen-lg mx-auto">
      {basketItems.length === 0 ? (
        <p>Din kurv er tom. Du bliver omdirigeret til forsiden.</p>
      ) : (
        <>
          <BasketItems
            basketItems={basketItems}
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
            packagesData={packagesData}
            drinksData={drinksData}
            updateQuantity={updateQuantity}
            explodedItems={explodedItems}
            triggerExplosion={triggerExplosion}
            removeItem={removeItem}
            totalPrice={totalPrice}
            totalRecyclingFee={totalRecyclingFee}
          />

          <CustomerDetails
            customerDetails={customerDetails}
            updateCustomerDetails={updateCustomerDetails}
            updateDeliveryDetailsInBackend={updateDeliveryDetailsInBackend}
            errors={errors}
            setErrors={setErrors}
            touchedFields={touchedFields}
            setTouchedFields={setTouchedFields}
            submitAttempted={submitAttempted}
          />

          <div className="mb-4">
            <ShippingAndPayment
              deliveryOption={deliveryOption}
              setDeliveryOption={setDeliveryOption}
              customerDetails={customerDetails}
              updateDeliveryDetailsInBackend={updateDeliveryDetailsInBackend}
              selectedPoint={selectedPoint}
              setSelectedPoint={setSelectedPoint}
            />
          </div>

          <OrderConfirmation
            customerDetails={customerDetails}
            deliveryOption={deliveryOption}
            selectedPoint={selectedPoint}
            updateDeliveryDetailsInBackend={updateDeliveryDetailsInBackend}
            totalPrice={totalPrice}
            totalRecyclingFee={totalRecyclingFee}
            basketItems={basketItems}
            basketSummary={basketSummary}
            errors={errors}
            setErrors={setErrors}
            touchedFields={touchedFields}
            setTouchedFields={setTouchedFields}
            submitAttempted={submitAttempted}
            setSubmitAttempted={setSubmitAttempted}
          />
        </>
      )}
    </div>
  );
}
