// src/App.tsx

import { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { StoredEntry } from './types';
import './App.css';

function App() {
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch entries from storage when the component mounts
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const storedEntries = await StorageService.getEntries();
      setEntries(storedEntries);
      setLoading(false);
    };

    fetchEntries();

    // Set up a listener for real-time updates from chrome.storage
    const storageListener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes.entries) {
        setEntries(changes.entries.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    // Cleanup listener when the component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  // Handle the deletion of an entry
  const handleDelete = async (questionToDelete: string) => {
    await StorageService.deleteEntry(questionToDelete);
    // The storage listener will automatically update the UI,
    // but we can also update it immediately for a faster feel.
    setEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.question !== questionToDelete)
    );
  };

  return (
    <div className="w-96 p-4 bg-gray-50 font-sans">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">TypeOnce Data</h1>
        <p className="text-sm text-gray-500">Your saved form entries.</p>
      </header>
      <main>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : entries.length > 0 ? (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.question}
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-700 truncate">
                    {entry.question}
                  </p>
                  <p className="text-gray-600 truncate">{entry.answer}</p>
                </div>
                <button
                  onClick={() => handleDelete(entry.question)}
                  className="p-1.5 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label={`Delete ${entry.question}`}
                >
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="font-semibold">No entries found.</p>
            <p className="text-sm mt-1">
              Start by clicking the ✨ icon on a webpage form field.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
