// pages/products/vi-blander-for-dig/[slug].js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useBasket } from '../../../components/BasketContext';
import axios from 'axios';
import Loading from '/components/Loading';

export default function ViBlanderForDigProduct() {
  const router = useRouter();
  const { slug } = router.query;

  const [product, setProduct] = useState(null);
  const [drinksData, setDrinksData] = useState({});
  const [loading, setLoading] = useState(true);
  const [randomSelection, setRandomSelection] = useState({});
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sugarPreference, setSugarPreference] = useState('alle');
  const [isMysteryBox, setIsMysteryBox] = useState(false);

  const { addItemToBasket } = useBasket();

  useEffect(() => {
    if (!slug) return;

    const fetchProductAndDrinks = async () => {
      try {
        // Fetch product data
        const productResponse = await axios.get(`/api/packages/${slug}`);
        const productData = productResponse.data.package;
        setProduct(productData);

        // Set default selected size
        if (productData.packages && productData.packages.length > 0) {
          setSelectedSize(productData.packages[0].size);
        }

        // Fetch drinks data
        const drinksResponse = await axios.post('/api/getDrinksBySlugs', {
          slugs: productData.collections_drinks,
        });
        setDrinksData(drinksResponse.data.drinks);
      } catch (error) {
        console.error('Error fetching product or drinks:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndDrinks();
  }, [slug]);

  useEffect(() => {
    if (!loading && product && Object.keys(drinksData).length > 0 && selectedSize) {
      generateRandomPackage(selectedSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, product, drinksData, sugarPreference, selectedSize]);

  // Function to generate a random package
  const generateRandomPackage = (size) => {
    if (!product || Object.keys(drinksData).length === 0) return;

    const randomSelection = {};
    let remaining = parseInt(size);

    // Filter drinks based on sugar preference
    let drinksCopy = [...product.collections_drinks].filter((drinkSlug) => {
      const drink = drinksData[drinkSlug];
      if (!drink) return false;
      if (sugarPreference === 'uden_sukker' && !drink.isSugarFree) return false;
      if (sugarPreference === 'med_sukker' && drink.isSugarFree) return false;
      return true; // For 'alle', include all drinks
    });

    if (drinksCopy.length === 0) {
      alert('No drinks match your sugar preference.');
      return;
    }

    while (remaining > 0) {
      const randomIndex = Math.floor(Math.random() * drinksCopy.length);
      const drinkSlug = drinksCopy[randomIndex];
      const drink = drinksData[drinkSlug];
      if (!drink) {
        drinksCopy.splice(randomIndex, 1);
        continue;
      }
      const qty = 1; // Select one at a time
      randomSelection[drinkSlug] = (randomSelection[drinkSlug] || 0) + qty;
      remaining -= qty;
    }

    setRandomSelection(randomSelection);

    // Fetch price from API
    fetchPrice(randomSelection);
  };

  const fetchPrice = async (selection) => {
    try {
      const response = await axios.post('/api/getPackagePrice', {
        selectedProducts: selection,
        selectedSize,
        slug,
      });

      if (response.data.price) {
        setPrice(response.data.price); // Set the discounted price
        setOriginalPrice(response.data.originalPrice); // Set the original price
      } else {
        console.error('Price not returned from API:', response.data);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  // Function to handle package size change
  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  // Function to add the random package to the basket
  const addToBasket = () => {
    const totalSelected = Object.values(randomSelection).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (totalSelected !== parseInt(selectedSize)) {
      alert('Error generating the package. Please try again.');
      return;
    }

    const description = isMysteryBox
      ? 'A mystery mix of drinks'
      : `A mix of: ${Object.entries(randomSelection)
          .map(
            ([drinkSlug, qty]) =>
              `${drinksData[drinkSlug]?.name || drinkSlug} (x${qty})`
          )
          .join(', ')}`;

    const mixedProduct = {
      slug: product.slug,
      title: `${product.title} - ${selectedSize} pcs`,
      description: description,
      image: product.image,
      price: price, // Discounted price
      originalPrice: originalPrice, // Original price
      quantity: quantity,
      selectedSize: selectedSize,
      selectedProducts: randomSelection,
    };

    addItemToBasket(mixedProduct);
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="container mx-auto p-8">
      {/* Product Title */}
      <h1 className="text-4xl font-bold text-center mb-8">{product.title}</h1>

      <div className="flex flex-col md:flex-row">
        {/* Left Column: Image and Description */}
        <div className="md:w-1/2 flex-1">
          <img src={product.image} alt={product.title} className="w-full h-auto" />

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-2">Description</h2>
            <p className="text-lg text-gray-700">{product.description}</p>
          </div>
        </div>

        {/* Right Column: Random Package and Actions */}
        <div className="md:w-1/2 md:pl-8 flex flex-col justify-between h-full flex-1">
          <div>
            {/* Package Size Selection */}
            <div className="mt-4">
              <p>Select Package Size:</p>
              {product.packages ? (
                product.packages.map((pkg) => (
                  <label key={pkg.size} className="mr-4">
                    <input
                      type="radio"
                      name="size"
                      value={pkg.size}
                      checked={selectedSize === pkg.size}
                      onChange={() => handleSizeChange(pkg.size)}
                    />
                    {pkg.size} pcs
                  </label>
                ))
              ) : (
                <p>No package sizes available.</p>
              )}
            </div>

            {/* Sugar Preference Selection */}
            <div className="mt-4">
              <p>With or without sugar:</p>
              <label className="mr-4">
                <input
                  type="radio"
                  name="sugarPreference"
                  value="uden_sukker"
                  checked={sugarPreference === 'uden_sukker'}
                  onChange={() => setSugarPreference('uden_sukker')}
                />
                uden sukker
              </label>
              <label className="mr-4">
                <input
                  type="radio"
                  name="sugarPreference"
                  value="med_sukker"
                  checked={sugarPreference === 'med_sukker'}
                  onChange={() => setSugarPreference('med_sukker')}
                />
                med sukker
              </label>
              <label className="mr-4">
                <input
                  type="radio"
                  name="sugarPreference"
                  value="alle"
                  checked={sugarPreference === 'alle'}
                  onChange={() => setSugarPreference('alle')}
                />
                Alle (både med og uden sukker)
              </label>
            </div>

            {/* Mysterybox Toggle */}
            <div className="mt-4 flex items-center">
              <label className="mr-4">Mysterybox</label>
              <label className="iphone-toggle">
                <input
                  type="checkbox"
                  checked={isMysteryBox}
                  onChange={() => setIsMysteryBox(!isMysteryBox)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Display Random Package or Mysterybox */}
            <div
              className={`mt-4 h-[30rem] pr-4 border border-gray-300 rounded ${
                isMysteryBox ? 'overflow-hidden' : 'overflow-y-auto'
              }`}
            >
              <h2 className="text-xl font-bold text-center mt-4">
                {isMysteryBox ? 'Mysterybox enabled' : `Your Random ${product.title}`}
              </h2>
              {isMysteryBox ? (
                // Display a question mark in the center
                <div className="flex items-center justify-center h-full">
                  <div className="text-8xl text-gray-400 mt-4">?</div>
                </div>
              ) : (
                // Display the list of drinks
                <ul className="list-disc list-inside mt-4 px-4">
                  {Object.entries(randomSelection).map(([drinkSlug, qty], index) => (
                    <li key={index}>
                      {drinksData[drinkSlug]?.name || drinkSlug} (x{qty})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8">
            {/* Generate Button */}
            <button
              onClick={() => generateRandomPackage(selectedSize)}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition w-full"
            >
              Generate New Package
            </button>

            {/* Add to Basket Button */}
            <button
              onClick={addToBasket}
              className="mt-4 bg-red-500 text-white px-6 py-2 rounded-full shadow hover:bg-red-600 transition w-full"
            >
              Add to Cart
            </button>

            {/* Price */}
            <div className="text-2xl font-bold mt-4">
              {originalPrice > price ? (
                <>
                  <span className="line-through text-gray-500 mr-2">
                    {(originalPrice / 100).toFixed(2)} kr
                  </span>
                  <span>{(price / 100).toFixed(2)} kr</span>
                </>
              ) : (
                <span>{(price / 100).toFixed(2)} kr</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Include CSS for iPhone-style toggle */}
      <style jsx>{`
        .iphone-toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }

        .iphone-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .iphone-toggle .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          border-radius: 34px;
          transition: 0.4s;
        }

        .iphone-toggle .slider:before {
          position: absolute;
          content: '';
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          border-radius: 50%;
          transition: 0.4s;
        }

        .iphone-toggle input:checked + .slider {
          background-color: #2196f3;
        }

        .iphone-toggle input:focus + .slider {
          box-shadow: 0 0 1px #2196f3;
        }

        .iphone-toggle input:checked + .slider:before {
          transform: translateX(22px);
        }
      `}</style>
    </div>
  );
}
