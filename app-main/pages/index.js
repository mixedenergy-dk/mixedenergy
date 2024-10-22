// pages/index.js

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Loading from '../components/Loading';

export default function Home() {
  const [blandSelvMixProducts, setBlandSelvMixProducts] = useState([]);
  const [viBlanderForDigProducts, setViBlanderForDigProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/getPackages');
        const packagesData = response.data.packages; // Now an array

        // Separate products by category
        const blandSelvMix = packagesData.filter(
          (product) => product.category === 'bland-selv-mix'
        );
        const viBlanderForDig = packagesData.filter(
          (product) => product.category === 'vi-blander-for-dig'
        );

        setBlandSelvMixProducts(blandSelvMix);
        setViBlanderForDigProducts(viBlanderForDig);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="w-full" style={{ backgroundColor: '#212121' }}>
        <div
          className="w-full hidden lg:block"
          style={{
            height: '50vh',
            backgroundImage: "url('/images/Color-logo-with-background.png')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>
      </div>

      {/* Vi blander for dig Section */}
      <div className="w-full text-center py-6">
        <h1 className="text-3xl font-bold">Vi blander for dig</h1>
      </div>

      <div className="flex flex-wrap justify-center p-4 max-w-screen-xl mx-auto">
        {viBlanderForDigProducts.map((product) => (
          <Link
            href={`/products/vi-blander-for-dig/${product.slug}`}
            key={product.id}
          >
            <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
                <div className="w-full h-60">
                  <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h2 className="text-xl font-bold">{product.title}</h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>

      {/* Bland selv mix Section */}
      <div className="w-full text-center py-6">
        <h1 className="text-3xl font-bold">Bland selv mix</h1>
      </div>

      <div className="flex flex-wrap justify-center p-4 max-w-screen-xl mx-auto">
        {blandSelvMixProducts.map((product) => (
          <Link
            href={`/products/bland-selv-mix/${product.slug}`}
            key={product.id}
          >
            <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
                <div className="w-full h-60">
                  <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h2 className="text-xl font-bold">{product.title}</h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
