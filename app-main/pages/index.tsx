// pages/index.tsx

import React, { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Loading from '../components/Loading';

// Define an interface for your product data
interface Product {
  id: string;
  slug: string;
  title: string;
  image?: string;
  description?: string;
  category?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// console.log('SUPABASE_URL:', SUPABASE_URL);

const buildImageUrl = (imagePath?: string): string => {
  if (!imagePath) {
    return '/images/xdefault-drink.png';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return SUPABASE_URL ? `${SUPABASE_URL}${normalizedPath}` : normalizedPath;
};

export default function Home(): JSX.Element {
  const [blandSelvMixProducts, setBlandSelvMixProducts] = useState<Product[]>([]);
  const [viBlanderForDigProducts, setViBlanderForDigProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // NEW: /api/supabase/getPackages
        const response = await axios.get('/api/supabase/getPackages');
        const packagesData = response.data.packages as Product[];
  
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
      {/* Top Section / Logo Background */}
      <div className="w-full" style={{ backgroundColor: '#212121' }}>
        <div
          className="w-full hidden lg:block"
          style={{
            height: '50vh',
            backgroundImage: "url('/images/mixedenergy-logo-with-background.png')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>
      </div>

      {/* "Vi blander for dig" Section */}
      <div className="w-full text-center py-6">
        <h1 className="text-3xl font-bold">Vi blander for dig</h1>
      </div>

      <div className="grid w-full max-w-screen-xl grid-cols-[repeat(auto-fit,minmax(240px,1fr))] justify-center gap-6 px-4 pb-8 mx-auto">
        {viBlanderForDigProducts.map((product) => (
          <Link
            href={`/products/vi-blander-for-dig/${product.slug}`}
            key={product.id}
            className="flex h-full w-full max-w-sm mx-auto flex-col"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-lg">
              <div className="relative w-full bg-black/5 aspect-[775/463]">
                <img
                  src={buildImageUrl(product.image)}
                  alt={product.title}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <div className="flex-grow p-4">
                <h2 className="text-xl font-bold">{product.title}</h2>
                {/* <p className="text-gray-700">{product.description}</p> */}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* "Bland selv mix" Section */}
      <div className="w-full text-center py-6">
        <h1 className="text-3xl font-bold">Bland selv mix</h1>
      </div>

      <div className="grid w-full max-w-screen-xl grid-cols-[repeat(auto-fit,minmax(240px,1fr))] justify-center gap-6 px-4 pb-12 mx-auto">
        {blandSelvMixProducts.map((product) => (
          <Link
            href={`/products/bland-selv-mix/${product.slug}`}
            key={product.id}
            className="flex h-full w-full max-w-sm mx-auto flex-col"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-lg">
              <div className="relative w-full bg-black/5 aspect-[775/463]">
                <img
                  src={buildImageUrl(product.image)}
                  alt={product.title}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <div className="flex-grow p-4">
                <h2 className="text-xl font-bold">{product.title}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
