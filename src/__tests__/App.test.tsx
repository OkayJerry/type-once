// src/__tests__/App.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { StorageService } from '../services/storage';
import { StoredEntry } from '../types';

// Mock the StorageService to control its behavior in tests
jest.mock('../services/storage');

// Create a typed mock for type-safe testing
const mockedGetEntries = jest.mocked(StorageService.getEntries);
const mockedDeleteEntry = jest.mocked(StorageService.deleteEntry);

// Mock the chrome.storage.onChanged API
const addListenerMock = jest.fn();
const removeListenerMock = jest.fn();
Object.defineProperty(global, 'chrome', {
  value: {
    storage: {
      onChanged: {
        addListener: addListenerMock,
        removeListener: removeListenerMock,
      },
    },
  },
  writable: true,
});


describe('App Component', () => {
  const mockEntries: StoredEntry[] = [
    { question: 'Email', answer: 'test@example.com', embedding: [1] },
    { question: 'Password', answer: 'password123', embedding: [2] },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup the mock to return our sample data
    mockedGetEntries.mockResolvedValue(mockEntries);
  });

  it('should fetch and display stored entries on mount', async () => {
    render(<App />);
    
    // It should show a loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After loading, it should display the entries from our mock service
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('should call StorageService.deleteEntry when a delete button is clicked', async () => {
    render(<App />);

    // Wait for the entries to be loaded
    const deleteButton = await screen.findByLabelText('Delete Email');
    fireEvent.click(deleteButton);

    // Verify that our delete service method was called with the correct question
    expect(mockedDeleteEntry).toHaveBeenCalledWith('Email');
  });

  it('should remove the entry from the UI after deletion', async () => {
    render(<App />);
    
    // Wait for the entries to load
    const emailEntry = await screen.findByText('Email');
    const deleteButton = screen.getByLabelText('Delete Email');

    // Mock the delete function to resolve successfully
    mockedDeleteEntry.mockResolvedValue();

    // Click the delete button
    fireEvent.click(deleteButton);

    // The "Email" entry should be removed from the document
    await waitFor(() => {
      expect(emailEntry).not.toBeInTheDocument();
    });
  });

  it('should display a message when no entries are found', async () => {
    // Override the mock to return an empty array for this specific test
    mockedGetEntries.mockResolvedValue([]);
    render(<App />);

    // Check for the "No entries found" message
    expect(await screen.findByText('No entries found.')).toBeInTheDocument();
  });
});
