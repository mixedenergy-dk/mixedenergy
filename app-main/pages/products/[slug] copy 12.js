import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useBasket } from '../../lib/BasketContext';
import products from '../../lib/products'; // Import the products data
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const product = products[slug];
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('8'); // New state for radio buttons
  const [selectedProducts, setSelectedProducts] = useState({});
  const [price, setPrice] = useState(175); // State for price
  const { addItemToBasket } = useBasket();

  const allProducts = [
    'Red Bull Original - 0.25 l',
    'Red Bull Sukkerfri - 0.25 l',
    'Red Bull Zero - 0.25 l',
    'Red Bull Original Stor - 0.355 l',
    'Red Bull Sukkerfri Stor - 0.473 l',
    'Red Bull Red Edition Vandmelon - 0.25 l',
    'Red Bull Blue Edition - 0.25 l',
    'Red Bull Abrikos Edition - 0.25 l',
    'Red Bull Lilla Edition - 0.25 l',
    'Red Bull Summer Edition - 0.25 l',
  ];

  // Determine the max number of products that can be selected based on the selected size
  const maxProducts = selectedSize === '8' ? 8 : selectedSize === '12' ? 12 : 18;

  // Calculate the total number of selected products
  const totalSelected = Object.values(selectedProducts).reduce((acc, qty) => acc + qty, 0);

  useEffect(() => {
    // Dynamically update price based on selected size
    if (selectedSize === '8') {
      setPrice(175); // Price for 8 items
    } else if (selectedSize === '12') {
      setPrice(220); // Price for 12 items
    } else if (selectedSize === '18') {
      setPrice(299); // Price for 18 items
    }
  }, [selectedSize]);

  // Function to generate random products
  const generateRandomProducts = () => {
    const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
    const selectedRandomProducts = shuffledProducts.slice(0, maxProducts);
    const randomSelection = selectedRandomProducts.reduce((acc, product) => {
      acc[product] = 1; // Set each product's quantity to 1
      return acc;
    }, {});
    setSelectedProducts(randomSelection);
  };

  // Check if the current page is one of the specified pages
  const isSpecialPage = ['/products/mixed-any', '/products/mixed-red-bulls', '/products/mixed-monsters', '/products/mixed-booster'].includes(router.asPath);

  if (!product) {
    return <p>Indlæser...</p>;
  }

  const addMixedToBasket = () => {
    if (totalSelected !== maxProducts) {
      alert(`Vælg præcis ${maxProducts} produkter.`);
      return;
    }

    const mixedProduct = {
      title: `Blandet Red Bulls - Størrelse ${selectedSize}`,
      description: `En blanding af følgende Red Bulls: ${Object.entries(selectedProducts)
        .map(([product, qty]) => `${product} (x${qty})`)
        .join(', ')}`,
      price, // Using the dynamically set price
      quantity,
      selectedSize,
      selectedProducts, // Store the selected products for later reference
    };

    addItemToBasket(mixedProduct); // Send the mixed product to the basket
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8">
      {/* Centered title at the top */}
      <h1 className="text-5xl font-bold text-center mb-8">Mixed Red Bulls</h1>

      {/* Center the image and product selection */}
      <div className="flex flex-row items-start justify-center w-full max-w-4xl gap-8">
        {/* Image and description container */}
        <div className="flex-shrink-0">
          <div className="w-[500px]"> {/* This div ensures the content inside is the same width as the image */}
            <Image
              src={product.image}
              alt={product.title}
              width={500}  // Adjusted image width
              height={500} // Adjusted image height
              className="rounded-lg shadow-lg"
            />

            {/* Beskrivelse section directly under the image with the same width */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-2">Beskrivelse</h2>
              <p className="text-lg text-gray-700">
                Lad selv en kasse med jeres favorit Red Bulls, vi har alle de forskellige smage som Red Bull har i Danmark, vi vil derefter pakke dem for jer og sende det til jer.
              </p>
            </div>
          </div>
        </div>

        {/* Product selection on the right */}
        <div className="flex-grow self-start"> {/* self-start aligns the top of this section with the top of the image */}
          {/* Radio buttons for selecting the size */}
          <div className="mt-0">
            <p>Vælg størrelse:</p>
            <label className="mr-4">
              <input
                type="radio"
                name="size"
                value="8"
                checked={selectedSize === '8'}
                onChange={() => setSelectedSize('8')}
              />
              8
            </label>
            <label className="mr-4">
              <input
                type="radio"
                name="size"
                value="12"
                checked={selectedSize === '12'}
                onChange={() => setSelectedSize('12')}
              />
              12
            </label>
            <label>
              <input
                type="radio"
                name="size"
                value="18"
                checked={selectedSize === '18'}
                onChange={() => setSelectedSize('18')}
              />
              18
            </label>
          </div>

          {/* Display all 10 products regardless of selected size */}
          {(selectedSize === '8' || selectedSize === '12' || selectedSize === '18') && (
            <div className="mt-4">
              <p>Vælg produkter (præcis {maxProducts}):</p>
              {allProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between mt-2">
                  <span>{product}</span>
                  {!isSpecialPage && (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleProductQuantityChange(product, 'decrement')}
                        className="px-2 py-1 bg-gray-200 rounded-l"
                        disabled={selectedProducts[product] <= 0 || !selectedProducts[product]}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 bg-gray-100">
                        {selectedProducts[product] || 0}
                      </span>
                      <button
                        onClick={() => handleProductQuantityChange(product, 'increment')}
                        className="px-2 py-1 bg-gray-200 rounded-r"
                        disabled={totalSelected >= maxProducts}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <p className="mt-2 text-red-600">{`Du har valgt ${totalSelected} af ${maxProducts} produkter.`}</p>
            </div>
          )}

          {/* Button to generate random products */}
          {isSpecialPage && (
            <button
              onClick={generateRandomProducts}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition"
            >
              Generer tilfældig liste af produkter
            </button>
          )}

          {/* Add to basket button */}
          <button
            onClick={addMixedToBasket}
            className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full shadow hover:bg-red-600 transition"
            disabled={totalSelected !== maxProducts} // Button is only enabled when the exact number of products is selected
          >
            Tilføj blandet til kurv
          </button>

          {/* Price below add to cart */}
          <p className="text-2xl font-bold mt-4">{price} kr</p> {/* Dynamic Price Display */}

          {/* Link to the list of drinks */}
          <Link href="/drinks">
            <a className="mt-4 text-blue-500 hover:underline">Liste over drikkevarer</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
