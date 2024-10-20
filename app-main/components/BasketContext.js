// lib/BasketContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore methods
import { db } from '../lib/firebase'; // Import your Firestore instance
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
    const [consentId, setConsentId] = useState(null);
    const [isNewItemAdded, setIsNewItemAdded] = useState(false); // New state for tracking item addition

    useEffect(() => {
        const consentIdFromCookie = getCookie('cookie_consent_id');
        setConsentId(consentIdFromCookie);

        if (consentIdFromCookie) {
            const docRef = doc(db, 'sessions_public', consentIdFromCookie);
            getDoc(docRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const sessionData = docSnap.data();
                    if (sessionData.basketItems) {
                        setBasketItems(sessionData.basketItems); // Load basket from Firestore
                    }
                    if (sessionData.customerDetails) {
                        setCustomerDetails(sessionData.customerDetails); // Load customer details from Firestore
                    }
                } else {
                    // Initialize an empty basket and customer details in Firestore
                    setDoc(docRef, { basketItems: [], customerDetails: {} }, { merge: true });
                }
            });
        }
    }, []);

    const updateBasketInFirestore = async (updatedBasket) => {
        if (!consentId) return; // Ensure consentId is available

        const docRef = doc(db, 'sessions_public', consentId);
        await setDoc(docRef, { basketItems: updatedBasket }, { merge: true }); // Update Firestore
    };

    const updateCustomerDetailsInFirestore = async (updatedDetails) => {
        if (!consentId) return; // Ensure consentId is available

        const docRef = doc(db, 'sessions_public', consentId);
        await setDoc(
            docRef,
            { customerDetails: updatedDetails },
            { merge: true }
        ); // Update Firestore with customer details
    };

    // Helper function to compare selected products
    const isSameSelection = (a, b) => {
        const aEntries = Object.entries(a).sort();
        const bEntries = Object.entries(b).sort();
        return JSON.stringify(aEntries) === JSON.stringify(bEntries);
    };

    const addItemToBasket = (item) => {
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
        setIsNewItemAdded(true); // Set to true when a new item is added
        updateBasketInFirestore(updatedBasket); // Update Firestore
    };

    const removeItemFromBasket = (index) => {
        const updatedBasket = basketItems.filter((_, i) => i !== index);
        setBasketItems(updatedBasket);
        updateBasketInFirestore(updatedBasket); // Update Firestore
    };

    // New function to update item quantity
    const updateItemQuantity = (index, newQuantity) => {
        if (newQuantity < 1) {
            return; // Do nothing if quantity is less than 1
        } else {
            const updatedBasket = basketItems.map((item, i) =>
                i === index ? { ...item, quantity: newQuantity } : item
            );
            setBasketItems(updatedBasket);
            updateBasketInFirestore(updatedBasket); // Update Firestore
        }
    };

    const updateCustomerDetails = (updatedDetails) => {
        setCustomerDetails(updatedDetails);
        updateCustomerDetailsInFirestore(updatedDetails); // Update Firestore with new customer details
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
                updateItemQuantity, // Export the new function
            }}
        >
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => useContext(BasketContext);
