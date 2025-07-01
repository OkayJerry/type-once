import { useState, useEffect } from 'react';
import './App.css';

// Define the structure of a single submission
interface Submission {
  question: string;
  answer: string;
}

function App() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to delete a submission
  const handleDelete = (questionToDelete: string) => {
    const updatedSubmissions = submissions.filter(sub => sub.question !== questionToDelete);
    setSubmissions(updatedSubmissions);
    // Persist the change to chrome storage
    chrome.storage.local.set({ submissions: updatedSubmissions });
  };

  const fetchSubmissions = () => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get('submissions', (data) => {
        if (chrome.runtime.lastError) {
          console.error('Error fetching submissions:', chrome.runtime.lastError.message);
          setLoading(false);
          return;
        }
        setSubmissions(data.submissions || []);
        setLoading(false);
      });
    } else {
      console.log("Running outside a Chrome extension. Using mock data.");
      setSubmissions([
        { question: 'Sample Username', answer: 'devuser' },
        { question: 'Sample Email', answer: 'dev@example.com' },
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.submissions) {
        setSubmissions(changes.submissions.newValue || []);
      }
    };
    if (chrome && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(storageListener);
    }
    return () => {
      if (chrome && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
    };
  }, []);

  return (
    <div className="w-96 p-4 bg-gray-50 font-sans">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">TypeOnce Data</h1>
        <p className="text-sm text-gray-500">Your saved form entries.</p>
      </header>
      <main>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : submissions.length > 0 ? (
          <ul className="space-y-3">
            {submissions.map((sub) => (
              <li key={sub.question} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-700 truncate">{sub.question}</p>
                    <p className="text-gray-600 truncate">{sub.answer}</p>
                </div>
                <button 
                  onClick={() => handleDelete(sub.question)}
                  className="p-1.5 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label={`Delete ${sub.question}`}
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No submissions found. Start by filling out a form on any webpage!
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
