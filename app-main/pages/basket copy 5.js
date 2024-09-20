import { useState } from 'react';
import { useBasket } from '../lib/BasketContext';
import PickupPointsList from '../components/PickupPointsList';
import MapComponent from "../components/MapComponent";
import LoadingSpinner from '../components/LoadingSpinner';

export default function Basket() {
  const { basketItems, setBasketItems, removeItemFromBasket } = useBasket();
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
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPickupPoints, setShowPickupPoints] = useState(false);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromBasket(index);
    } else {
      const updatedBasket = basketItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      );
      setBasketItems(updatedBasket);
      localStorage.setItem('basket', JSON.stringify(updatedBasket));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const fetchPickupPoints = () => {
    if (customerDetails.city && customerDetails.postalCode && customerDetails.streetNumber) {
      fetch(`/api/postnord/servicepoints?city=${customerDetails.city}&postalCode=${customerDetails.postalCode}&streetName=${customerDetails.address}&streetNumber=${customerDetails.streetNumber}`)
        .then((res) => res.json())
        .then((data) => {
          setPickupPoints(data.servicePointInformationResponse?.servicePoints || []);
          setLoading(false);  // Stop loading after success
        })
        .catch((error) => {
          console.error('Error fetching PostNord service points:', error);
          setLoading(false);  // Stop loading even in case of error
        });
    } else {
      // Stop loading if customerDetails are incomplete
      setLoading(false);
    }
  };
  
  const validateAddressWithDAWA = async () => {
    try {
      const response = await fetch('/api/dawa/datavask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerDetails),
      });
  
      const data = await response.json();
  
      setCustomerDetails((prevState) => ({
        ...prevState,
        streetNumber: data.dawaResponse.resultater[0].adresse.husnr,
      }));
  
      fetchPickupPoints();  // After validating address, fetch pickup points
  
    } catch (error) {
      console.error('Error validating address with DAWA:', error);
      setLoading(false);  // Stop loading in case of an error
    }
  };
  

  const handleShowPickupPoints = () => {
    setLoading(true);  // Set loading before validating
    validateAddressWithDAWA();  // This will handle pickup points fetching as well
  };
  

  return (
    <div className="p-8 w-full max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8">Min Kurv</h1>

      {basketItems.length === 0 ? (
        <p>Din kurv er tom</p>
      ) : (
        <>
          {basketItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between mb-4 p-4 border rounded">
              <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1 ml-4">
                <h2 className="text-xl font-bold">{item.title}</h2>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded-l"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 bg-gray-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded-r"
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-700 mt-2">Pris pr ramme: {item.price}kr</p>
                <p className="text-gray-700 mt-2">Totalpris: {(item.price * item.quantity).toFixed(2)}kr</p>
              </div>
              <button onClick={() => removeItemFromBasket(index)} className="text-red-600">Fjern</button>
            </div>
          ))}

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Kundeoplysninger</h2>

            {/* Render all customer details fields */}
            <div className="mb-4">
              <label className="block mb-2">Fulde Navn</label>
              <input
                type="text"
                name="fullName"
                value={customerDetails.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Mobilnummer</label>
              <input
                type="text"
                name="mobileNumber"
                value={customerDetails.mobileNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">E-mail Adresse</label>
              <input
                type="email"
                name="email"
                value={customerDetails.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Vejnavn og Husnummer</label>
              <input
                type="text"
                name="address"
                value={customerDetails.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Postnummer</label>
              <input
                type="text"
                name="postalCode"
                value={customerDetails.postalCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">By</label>
              <input
                type="text"
                name="city"
                value={customerDetails.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <button
              onClick={handleShowPickupPoints}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition"
            >
              Fortsæt
            </button>

            {/* Conditionally render the map and pickup points after clicking "Fortsæt" */}
            {showPickupPoints && (
              <div className="mt-8" style={{ height: '545px' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                      <LoadingSpinner />
                      <p className="mt-4 font-bold">Henter afhentningssteder</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4 h-full">
                    <div
                      className="w-full lg:w-1/2 overflow-y-scroll"
                      style={{ maxHeight: '545px' }}
                    >
                      <h2 className="text-xl font-bold mb-4">Vælg et afhentningssted</h2>
                      <PickupPointsList pickupPoints={pickupPoints} />
                    </div>
                    <div className="w-full lg:w-1/2" style={{ height: '545px' }}>
                      <MapComponent pickupPoints={pickupPoints} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-right text-xl font-bold mt-6">
            Total: {basketItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}kr
          </div>

          <div className="flex items-center mt-6">
            <input type="checkbox" id="terms" className="mr-2" />
            <label htmlFor="terms">Accepter vilkår og betingelser</label>
          </div>

          <button onClick={() => alert('Checkout process')} className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full shadow hover:bg-red-600 transition">
            BETAL
          </button>
        </>
      )}
    </div>
  );
}