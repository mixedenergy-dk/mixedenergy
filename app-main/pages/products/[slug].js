import { useState, useEffect } from 'react';

const redBullVariants = [
  { name: 'Red Bull Original', color: '#002776' },
  { name: 'Red Bull Sugarfree', color: '#0074D9' },
  { name: 'Red Bull Tropical', color: '#FFD700' },
  { name: 'Red Bull Watermelon', color: '#FF4500' },
  { name: 'Red Bull Blueberry', color: '#4B0082' },
];

const ProductMatrix = ({ addItemToBasket }) => {
  const [matrixSize, setMatrixSize] = useState(3); // Default 3x3 matrix
  const [matrix, setMatrix] = useState([]);
  const [canSize, setCanSize] = useState(250); // Default can size is 250ml

  // Function to generate a random drink matrix
  const generateRandomMatrix = () => {
    const newMatrix = [];
    const rows = matrixSize;
    const cols = matrixSize;
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

  // Automatically generate matrix on component mount
  useEffect(() => {
    generateRandomMatrix();
  }, [matrixSize]);

  // Increase or decrease matrix size
  const increaseMatrixSize = () => {
    if (matrixSize < 6) {
      setMatrixSize(matrixSize + 1);
    }
  };

  const decreaseMatrixSize = () => {
    if (matrixSize > 3) {
      setMatrixSize(matrixSize - 1);
    }
  };

  // Increase or decrease can size
  const increaseCanSize = () => {
    if (canSize < 473) {
      setCanSize(canSize === 250 ? 355 : 473);
    }
  };

  const decreaseCanSize = () => {
    if (canSize > 250) {
      setCanSize(canSize === 473 ? 355 : 250);
    }
  };

  const handleAddToBasket = () => {
    const uniqueMatrix = { matrix, canSize, matrixSize };
    addItemToBasket(uniqueMatrix);
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Choose Your Red Bull</h2>

      {/* Box Size Controls */}
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

      {/* Can Size Controls */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={decreaseCanSize}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          disabled={canSize === 250}
        >
          -
        </button>
        <span className="text-blue-900 font-bold text-xl">{canSize}ml Can Size</span>
        <button
          onClick={increaseCanSize}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          disabled={canSize === 473}
        >
          +
        </button>
      </div>

      {/* Generate Matrix Button */}
      <button
        onClick={generateRandomMatrix}
        className="mt-4 mb-4 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
      >
        Generate Matrix
      </button>

      {/* Display Random Drink Matrix */}
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

      {/* Add to Basket Button */}
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
