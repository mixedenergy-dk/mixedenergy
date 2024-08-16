// /components/ProductMatrix.js
import { useState } from 'react';

const redBullVariants = [
  { name: 'Red Bull Original', color: '#002776' },
  { name: 'Red Bull Sugarfree', color: '#0074D9' },
  { name: 'Red Bull Tropical', color: '#FFD700' },
  { name: 'Red Bull Watermelon', color: '#FF4500' },
  { name: 'Red Bull Blueberry', color: '#4B0082' },
];

const ProductMatrix = ({ addItemToBasket }) => {
  const [matrixSize, setMatrixSize] = useState(3);
  const [matrix, setMatrix] = useState([]);
  const [canSize, setCanSize] = useState('250ml');

  const generateRandomMatrix = (size) => {
    const newMatrix = [];
    const rows = size === 3 ? 3 : size === 4 ? 4 : 6;
    const cols = size === 3 ? 3 : size === 4 ? 4 : 6;
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const randomDrink = redBullVariants[Math.floor(Math.random() * redBullVariants.length)];
        row.push(randomDrink.color);
      }
      newMatrix.push(row);
    }
    setMatrix(newMatrix);
  };

  const increaseMatrixSize = () => {
    if (matrixSize === 3) {
      setMatrixSize(4);
      generateRandomMatrix(4);
    } else if (matrixSize === 4) {
      setMatrixSize(6);
      generateRandomMatrix(6);
    }
  };

  const decreaseMatrixSize = () => {
    if (matrixSize === 6) {
      setMatrixSize(4);
      generateRandomMatrix(4);
    } else if (matrixSize === 4) {
      setMatrixSize(3);
      generateRandomMatrix(3);
    }
  };

  const handleAddToBasket = () => {
    const uniqueMatrix = { matrix, size: canSize, gridSize: matrixSize };
    addItemToBasket(uniqueMatrix);
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Choose Your Red Bull</h2>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={decreaseMatrixSize}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          disabled={matrixSize === 3}
        >
          -
        </button>
        <span className="text-blue-900 font-bold text-xl">
          {matrixSize === 3 ? 'Box of 9' : matrixSize === 4 ? 'Box of 16' : 'Box of 24'}
        </span>
        <button
          onClick={increaseMatrixSize}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          disabled={matrixSize === 6}
        >
          +
        </button>
      </div>
      <div className={`grid gap-1 ${matrixSize === 6 ? 'grid-cols-6' : matrixSize === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {matrix.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
          ))
        )}
      </div>
      <div className="mt-4">
        <label className="block text-blue-900 font-bold mb-2">Select Can Size:</label>
        <select
          value={canSize}
          onChange={(e) => setCanSize(e.target.value)}
          className="bg-white border border-gray-300 rounded py-2 px-4"
        >
          <option value="250ml">250ml</option>
          <option value="355ml">355ml</option>
          <option value="473ml">473ml</option>
        </select>
      </div>
      <button
        onClick={handleAddToBasket}
        className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
      >
        Add to Basket
      </button>
    </div>
  );
};

export default ProductMatrix;
