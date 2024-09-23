import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBasket } from '../lib/BasketContext';

const Header = () => {
    const { basketItems } = useBasket();
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [isNewItemAdded, setIsNewItemAdded] = useState(false);

    // Detect if a new item was added to the basket
    useEffect(() => {
        if (basketItems.length > 0) {
            setIsNewItemAdded(true);
            // Stop pulsing animation after a few seconds
            const timer = setTimeout(() => setIsNewItemAdded(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [basketItems]);

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
            e.preventDefault(); // Prevent navigation if the basket is empty
        }
    };

    return (
        <header
            className="flex justify-between items-center p-4 shadow"
            style={{ backgroundColor: '#fab93d' }}
        >
            <a href="/" className="flex items-center">
                <Image src="/images/mixedenergy-logo.png" alt="Logo" width={50} height={50} />
                <h1 className="text-3xl font-bold ml-2">Mixed Energy</h1>
            </a>
            <nav className="flex space-x-4">
                {/* Add navigation links here if needed */}
            </nav>
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
                                className={`absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center ${
                                    isNewItemAdded ? 'animate-pulse' : ''
                                }`}
                            >
                                {/* Render an empty red circle without a number */}
                            </div>
                        )}
                    </a>
                    {showEmptyMessage && (
                        <div className="absolute top-full mt-1 -left-24 bg-black text-white text-xs rounded p-2 shadow-lg">
                            Din indkøbskurv er tom
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
