// pages/drinks/[slug].tsx

import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../../components/Loading';
import { JSX } from 'react';

interface Drink {
  name: string;
  size: string;
  image: string;
  ingredients?: string;
  description?: string;
  nutrition?: {
    per100ml?: { [key: string]: string | number };
  };
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function DrinkDetail(): JSX.Element {
  const router = useRouter();
  const { slug } = router.query;

  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;

    const fetchDrink = async () => {
      try {
        const response = await axios.get(`/api/supabase/drinks/${slug}`);
        setDrink(response.data.drink);
      } catch (error) {
        console.error('Error fetching drink:', error);
        setDrink(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDrink();
  }, [slug]);

  if (loading) {
    return <Loading />;
  }

  if (!drink) {
    return <p>Drink not found.</p>;
  }

  const imageUrl = `${SUPABASE_URL}${drink.image}`;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8">
      <h1 className="text-4xl font-bold mb-8">{drink.name}</h1>
      <Image
        src={imageUrl}
        alt={drink.name}
        width={463}
        height={775}
        className="rounded-lg shadow-lg object-cover"
        onError={() => setImageError(true)}
      />
      <p className="text-xl text-gray-700 mt-4">Size: {drink.size}</p>

      {drink.description && (
        <div className="mt-4 w-full max-w-2xl">
          <h2 className="text-xl font-bold">Description:</h2>
          <p className="text-gray-600 ml-1">{drink.description}</p>
        </div>
      )}

      {drink.ingredients && (
        <div className="mt-4 w-full max-w-2xl">
          <h2 className="text-xl font-bold">Ingredients:</h2>
          <p className="text-gray-600 ml-1">{drink.ingredients}</p>
        </div>
      )}

      <div className="mt-4 w-full max-w-2xl">
        <h2 className="text-xl font-bold">Nutritional Information (per 100 mL):</h2>
        <ul className="list-disc list-inside ml-1">
          {drink.nutrition?.per100ml ? (
            Object.entries(drink.nutrition.per100ml).map(([key, value]) => (
              <li key={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
              </li>
            ))
          ) : (
            <li>No nutritional information available.</li>
          )}
        </ul>
      </div>

      <div className="mt-4 w-full max-w-2xl">
        <h2 className="text-xl font-bold">More Information:</h2>
        <p className="text-gray-600 ml-1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    </div>
  );
}