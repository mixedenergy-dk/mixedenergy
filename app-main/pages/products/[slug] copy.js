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
  const [selectedSize, setSelectedSize] = useState('8'); // State for radio buttons
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [price, setPrice] = useState(175); // State for price
  const { addItemToBasket } = useBasket();

  // List of products for old and new mix links
  const mixedAnyMixProducts = [
    'Red Bull Original - 0.25 l',
    'Monster Energy - 0.5 l',
    'Booster Energy - 0.5 l',
    'Red Bull Red Edition - 0.25 l',
  ];

  const mixedRedBullMixProducts = [
    'Red Bull Original - 0.25 l',
    'Red Bull Sukkerfri - 0.25 l',
    'Red Bull Zero - 0.25 l',
    'Red Bull Red Edition - 0.25 l',
  ];

  const mixedMonsterMixProducts = [
    'Monster Energy - 0.5 l',
    'Monster Zero - 0.5 l',
    'Monster Mango Loco - 0.5 l',
    'Monster Red - 0.5 l',
  ];

  const mixedBoosterMixProducts = [
    'Faxe Kondi Booster Original - 0.5 l',
    'Faxe Kondi Booster Free - 0.5 l',
    'Faxe Kondi Booster Black Edition - 0.5 l',
  ];

  // Products for sukkerfri (only Red Bull Sukkerfri and Zero variants)
  const sukkerfriProducts = [
    'Red Bull Sukkerfri - 0.25 l',
    'Red Bull Sukkerfri Stor - 0.473 l',
    'Red Bull Zero - 0.25 l',
  ];

  // Products with sugar (excluding sukkerfri variants)
  const medSukkerProducts = [
    'Red Bull Original - 0.25 l',
    'Red Bull Original Stor - 0.355 l',
    'Red Bull Red Edition Vandmelon - 0.25 l',
    'Red Bull Blue Edition - 0.25 l',
    'Red Bull Abrikos Edition - 0.25 l',
    'Red Bull Lilla Edition - 0.25 l',
    'Red Bull Summer Edition - 0.25 l',
  ];

  // Calculate max products based on selected size
  const maxProducts = selectedSize === '8' ? 8 : selectedSize === '12' ? 12 : 18;

  useEffect(() => {
    if (selectedSize === '8') {
      setPrice(175); // Price for 8 items
    } else if (selectedSize === '12') {
      setPrice(220); // Price for 12 items
    } else if (selectedSize === '18') {
      setPrice(299); // Price for 18 items
    }
  }, [selectedSize]);

  if (!product) {
    return <p>Indlæser...</p>;
  }

  const addMixedToBasket = () => {
    if (selectedProducts.length !== maxProducts) {
      alert(`Vælg præcis ${maxProducts} produkter.`);
      return;
    }

    const mixedProduct = {
      title: `Blandet - Størrelse ${selectedSize}`,
      description: `En blanding af følgende produkter: ${selectedProducts.join(', ')}`,
      price,
      selectedSize,
      selectedProducts,
    };

    addItemToBasket(mixedProduct);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 md:p-8">
      {/* Centered title at the top */}
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 md:mb-8">Blandet Produkter</h1>

      {/* Center the image and product selection */}
      <div className="flex flex-col md:flex-row items-start justify-center w-full max-w-4xl gap-8">
        {/* Image and description container */}
        <div className="w-full md:w-auto flex-shrink-0">
          <div className="w-full md:w-[500px]">
            <Image
              src={product.image}
              alt={product.title}
              width={500}
              height={500}
              className="rounded-lg shadow-lg"
            />

            {/* Beskrivelse section */}
            <div className="mt-4 md:mt-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Beskrivelse</h2>
              <p className="text-base md:text-lg text-gray-700">
                Vælg en tilfældig blanding af dine favoritter, og vi pakker det for dig.
              </p>
            </div>
          </div>
        </div>

        {/* Product selection */}
        <div className="flex-grow w-full">
          {/* Radio buttons for selecting the size */}
          <div className="mt-4 md:mt-0">
            <p>Vælg størrelse:</p>
            <label className="mr-2">
              <input
                type="radio"
                name="size"
                value="8"
                checked={selectedSize === '8'}
                onChange={() => setSelectedSize('8')}
              />
              8
            </label>
            <label className="mr-2">
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

          {/* Displaying the selected products */}
          <div className="mt-4">
            <p>Du har valgt følgende produkter:</p>
            <ul>
              {selectedProducts.map((product, index) => (
                <li key={index} className="mt-2">
                  {product}
                </li>
              ))}
            </ul>
          </div>

          {/* Add to basket button */}
          <button
            onClick={addMixedToBasket}
            className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full shadow hover:bg-red-600 transition w-full md:w-auto"
            disabled={selectedProducts.length !== maxProducts}
          >
            Tilføj blandet til kurv
          </button>

          {/* Price */}
          <p className="text-2xl font-bold mt-4">{price} kr</p>

          {/* Link to the list of drinks */}
          <Link href="/drinks">
            <a className="mt-4 text-blue-500 hover:underline">Liste over drikkevarer</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
