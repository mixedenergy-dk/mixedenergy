// components/DrinksTable.js

import React, { useState } from 'react';
import Modal from './Modal';

function DrinksTable({
  drinks,
  onDrinkChange,
  onSaveDrink,
  onDeleteDrink,
  onAddDrink,
}) {
  const [editingRows, setEditingRows] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDrink, setNewDrink] = useState({});
  const [modalStack, setModalStack] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);

  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const toggleEditing = (docId) => {
    setEditingRows((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  // Define the desired column order
  const columnOrder = [
    'name',
    '_stock', // Adjusted to match new data structure
    'size',
    'isSugarFree',
    'image',
    '_purchasePrice',
    '_salePrice',
    'nutrition',
    'recyclingFee', // Added if needed
  ];

  // Process the drinks prop into an array
  const drinksArray = React.useMemo(() => {
    if (Array.isArray(drinks)) {
      return drinks;
    } else if (drinks && typeof drinks === 'object') {
      return Object.keys(drinks).map((docId) => ({
        ...drinks[docId],
        docId,
      }));
    } else {
      return [];
    }
  }, [drinks]);

  // Function to handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to drinks data
  const sortedDrinks = React.useMemo(() => {
    let sortableDrinks = [...drinksArray];
    if (sortConfig.key !== null) {
      sortableDrinks.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        let order = 0;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          order = aValue - bValue;
        } else {
          order = aValue.toString().localeCompare(bValue.toString());
        }

        return sortConfig.direction === 'ascending' ? order : -order;
      });
    }
    return sortableDrinks;
  }, [drinksArray, sortConfig]);

  // Handle adding a new drink
  const handleAddDrink = () => {
    setNewDrink({
      name: '',
      _stock: 0,
      size: '',
      isSugarFree: false,
      image: '',
      _salePrice: 0,
      _purchasePrice: 0,
      nutrition: {},
      recyclingFee: 0,
    });
    setShowAddModal(true);
  };

  const handleSaveNewDrink = () => {
    onAddDrink(newDrink);
    setShowAddModal(false);
    setNewDrink({});
  };

  // Handle nested data editing (e.g., nutrition)
  const handleNestedDataChange = (path, value) => {
    const [docId, ...restPath] = path;
    onDrinkChange(docId, restPath, value);
  };

  // Handle cell clicks for nested objects
  const handleCellClick = (drink, key) => {
    const value = drink[key];
    if (typeof value === 'object' && value !== null) {
      // Open modal
      setModalStack([{ data: value, path: [drink.docId, key], title: key }]);
      setCurrentData(value);
      setCurrentPath([drink.docId, key]);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Drinks</h2>
      <button
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleAddDrink}
      >
        Add New Drink
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 bg-white">
            <tr>
              <th className="border px-4 py-2">Edit</th>
              {columnOrder.map((key) => (
                <th
                  key={key}
                  className="border px-4 py-2 cursor-pointer"
                  onClick={() => requestSort(key)}
                >
                  {key.startsWith('_') ? key.substring(1) : key}
                  {sortConfig.key === key ? (
                    sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽'
                  ) : null}
                </th>
              ))}
              <th className="border px-4 py-2">Save</th>
              <th className="border px-4 py-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sortedDrinks.map((drink) => {
              const isEditing = editingRows[drink.docId] || false;
              return (
                <tr key={drink.docId} className="border-b">
                  <td className="border px-4 py-2 text-center whitespace-nowrap">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => toggleEditing(drink.docId)}
                    >
                      {isEditing ? 'Lock' : 'Edit'}
                    </button>
                  </td>
                  {columnOrder.map((key) => {
                    const value = drink[key];
                    const isObject = typeof value === 'object' && value !== null;
                    const isPrivate = key.startsWith('_');

                    // Adjust cell width based on content
                    const cellStyle = {
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                    };

                    return (
                      <td
                        key={key}
                        className={`border px-4 py-2 ${
                          isPrivate ? 'text-red-500' : ''
                        }`}
                        style={cellStyle}
                      >
                        {/* Custom rendering for 'image' field */}
                        {key === 'image' ? (
                          <div className="flex flex-col items-center">
                            {typeof value === 'string' && value && (
                              <img src={value} alt="Drink" className="h-16 w-auto mb-2" />
                            )}
                            {isEditing && (
                              <input
                                type="file"
                                accept=".png"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    onDrinkChange(drink.docId, [key], file);
                                  }
                                }}
                              />
                            )}
                          </div>
                        ) : isObject ? (
                          <button
                            className="text-blue-500 underline"
                            onClick={() => handleCellClick(drink, key)}
                          >
                            Edit {key}
                          </button>
                        ) : (
                          <input
                            type={
                              typeof value === 'number'
                                ? 'number'
                                : key === 'isSugarFree'
                                ? 'checkbox'
                                : 'text'
                            }
                            value={key === 'isSugarFree' ? undefined : value || ''}
                            checked={key === 'isSugarFree' ? value || false : undefined}
                            onChange={(e) => {
                              let newValue;
                              if (e.target.type === 'checkbox') {
                                newValue = e.target.checked;
                              } else if (e.target.type === 'number') {
                                newValue = e.target.valueAsNumber; // Use valueAsNumber for number inputs
                              } else {
                                newValue = e.target.value;
                              }
                              if (key !== 'docId') {
                                onDrinkChange(drink.docId, [key], newValue);
                              }
                            }}
                            disabled={!isEditing || key === 'docId'}
                            className={`border p-1 w-full ${
                              isPrivate ? 'text-red-500' : ''
                            }`}
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="border px-4 py-2 text-center whitespace-nowrap">
                    {isEditing && (
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => onSaveDrink(drink)}
                      >
                        Save
                      </button>
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center whitespace-nowrap">
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => onDeleteDrink(drink.docId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add New Drink Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Drink"
        >
          <div className="space-y-4">
            {columnOrder.map((key) => {
              if (key === 'docId') return null;
              const value = newDrink[key];
              const isObject = typeof value === 'object' && value !== null;
              const isPrivate = key.startsWith('_');

              return (
                <div key={key}>
                  <label
                    className={`block text-sm font-medium ${
                      isPrivate ? 'text-red-500' : 'text-gray-700'
                    }`}
                  >
                    {key.startsWith('_') ? key.substring(1) : key}
                  </label>
                  {key === 'image' ? (
                    <div className="flex flex-col items-center">
                      {typeof value === 'string' && value && (
                        <img src={value} alt="Drink" className="h-16 w-auto mb-2" />
                      )}
                      <input
                        type="file"
                        accept=".png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setNewDrink({
                              ...newDrink,
                              [key]: file,
                            });
                          }
                        }}
                      />
                    </div>
                  ) : isObject ? (
                    <button
                      className="text-blue-500 underline"
                      onClick={() => {
                        setModalStack([{ data: value, path: [key], title: key }]);
                        setCurrentData(value);
                        setCurrentPath([key]);
                      }}
                    >
                      Edit {key}
                    </button>
                  ) : (
                    <input
                      type={
                        typeof value === 'number'
                          ? 'number'
                          : key === 'isSugarFree'
                          ? 'checkbox'
                          : 'text'
                      }
                      value={key === 'isSugarFree' ? undefined : value || ''}
                      checked={key === 'isSugarFree' ? value || false : undefined}
                      onChange={(e) => {
                        const val =
                          e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                        setNewDrink({
                          ...newDrink,
                          [key]: val,
                        });
                      }}
                      className={`border p-1 w-full ${isPrivate ? 'text-red-500' : ''}`}
                    />
                  )}
                </div>
              );
            })}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveNewDrink}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for nested data */}
      {currentData && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (modalStack.length > 1) {
              setModalStack(modalStack.slice(0, -1));
              const previous = modalStack[modalStack.length - 2];
              setCurrentData(previous.data);
              setCurrentPath(previous.path);
            } else {
              setCurrentData(null);
              setCurrentPath([]);
              setModalStack([]);
            }
          }}
          title={`Edit ${modalStack[modalStack.length - 1].title}`}
        >
          {Object.keys(currentData).map((key) => {
            const value = currentData[key];
            const isObject = typeof value === 'object' && value !== null;

            return (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{key}</label>
                {isObject ? (
                  <button
                    className="text-blue-500 underline"
                    onClick={() => {
                      setModalStack([
                        ...modalStack,
                        {
                          data: value,
                          path: [...currentPath, key],
                          title: key,
                        },
                      ]);
                      setCurrentData(value);
                      setCurrentPath([...currentPath, key]);
                    }}
                  >
                    Edit {key}
                  </button>
                ) : (
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const newData = { ...currentData, [key]: newValue };
                      setCurrentData(newData);
                      handleNestedDataChange([...currentPath, key], newValue);
                    }}
                    className="border p-1 w-full"
                  />
                )}
              </div>
            );
          })}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (modalStack.length > 1) {
                  setModalStack(modalStack.slice(0, -1));
                  const previous = modalStack[modalStack.length - 2];
                  setCurrentData(previous.data);
                  setCurrentPath(previous.path);
                } else {
                  setCurrentData(null);
                  setCurrentPath([]);
                  setModalStack([]);
                }
              }}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Back
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DrinksTable;
