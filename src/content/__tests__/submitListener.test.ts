// src/content/__tests__/submitListener.test.ts

import { handleFormSubmit } from '../submitListener';

// Mock the chrome.storage.local API
const storageMock = (() => {
  let store: { [key: string]: any } = {};
  return {
    get: jest.fn((keys, callback) => {
      // Ensure that `keys` is an array, as it can be a string or an array of strings.
      const keysToProcess = Array.isArray(keys) ? keys : [keys];
      const result = keysToProcess.reduce((acc, key) => {
        if (store[key] !== undefined) {
          acc[key] = store[key];
        }
        return acc;
      }, {} as { [key: string]: any });
      callback(result);
    }),
    set: jest.fn((items, callback) => {
      store = { ...store, ...items };
      if (callback) {
        callback();
      }
    }),
    clear: () => {
      store = {};
    },
    // A helper for our tests to inspect the mock store
    getStore: () => store,
  };
})();

// Assign the mock to the global chrome object before each test
beforeAll(() => {
  Object.defineProperty(global, 'chrome', {
    value: {
      storage: {
        local: storageMock,
      },
    },
    writable: true,
  });
});

// Clear the mock store before each test
beforeEach(() => {
  storageMock.clear();
  storageMock.set.mockClear();
  storageMock.get.mockClear();
});

describe('handleFormSubmit', () => {
  // Helper function to create a mock form
  const createMockForm = (data: { [key: string]: string }): HTMLFormElement => {
    const form = document.createElement('form');
    for (const key in data) {
      const input = document.createElement('input');
      input.name = key;
      input.id = key; // This ID is crucial for associating the label with the input.
      input.value = data[key];
      // Add a corresponding label
      const label = document.createElement('label');
      label.htmlFor = key;
      label.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
      form.appendChild(label);
      form.appendChild(input);
    }
    return form;
  };

  it('should save new submissions when storage is empty', () => {
    const form = createMockForm({
      username: 'testuser',
      email: 'test@example.com',
    });

    handleFormSubmit(form);

    // Check that chrome.storage.local.set was called with the correct data
    expect(storageMock.set).toHaveBeenCalledWith(
      {
        submissions: [
          { question: 'Username', answer: 'testuser' },
          { question: 'Email', answer: 'test@example.com' },
        ],
      },
      expect.any(Function)
    );
  });

  it('should update an existing submission with a new answer', () => {
    // Pre-fill storage with an existing submission
    const initialSubmissions = [{ question: 'Username', answer: 'olduser' }];
    storageMock.set({ submissions: initialSubmissions }, () => {});

    const form = createMockForm({ username: 'newuser' });

    handleFormSubmit(form);

    expect(storageMock.set).toHaveBeenCalledWith(
      {
        submissions: [{ question: 'Username', answer: 'newuser' }],
      },
      expect.any(Function)
    );
  });

  it('should add new submissions and update existing ones in the same operation', () => {
    // Pre-fill storage
    const initialSubmissions = [{ question: 'Username', answer: 'olduser' }];
    storageMock.set({ submissions: initialSubmissions }, () => {});

    const form = createMockForm({
      username: 'newuser',
      email: 'new@example.com',
    });

    handleFormSubmit(form);

    // The result should be sorted by question for consistent testing
    const expectedSubmissions = [
      { question: 'Email', answer: 'new@example.com' },
      { question: 'Username', answer: 'newuser' },
    ].sort((a, b) => a.question.localeCompare(b.question));
    
    // Get the actual call and sort its data. We need to get the most recent call to set().
    const lastCallIndex = storageMock.set.mock.calls.length - 1;
    const actualCall = storageMock.set.mock.calls[lastCallIndex][0];
    const actualSubmissions = actualCall.submissions.sort((a:any, b:any) => a.question.localeCompare(b.question));


    expect(actualSubmissions).toEqual(expectedSubmissions);
  });

  it('should ignore fields with empty values', () => {
    const form = createMockForm({
      username: 'testuser',
      notes: '', // This field should be ignored
    });

    handleFormSubmit(form);

    expect(storageMock.set).toHaveBeenCalledWith(
      {
        submissions: [{ question: 'Username', answer: 'testuser' }],
      },
      expect.any(Function)
    );
  });
});
