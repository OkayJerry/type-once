// src/content/__tests__/submitListener.test.ts
import { handleFormSubmit } from '../submitListener';

describe('handleFormSubmit', () => {
    beforeEach(() => {
        // Clear all mock call history before each test :contentReference[oaicite:10]{index=10}
        jest.clearAllMocks();
    });

  it('should store all form entries as QA pairs', () => {
    // 1. Create a fake form with two inputs
    document.body.innerHTML = `
      <form id="test-form">
        <label for="name">Name</label>
        <input name="name" id="name" value="Alice" />
        <label for="email">Email</label>
        <input name="email" id="email" value="alice@example.com" />
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;

    // 2. Call the handler
    handleFormSubmit(form);

    // 3. Expect chrome.storage.local.set called once
    expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);

    // 4. Inspect the stored object
    const [[arg]] = (chrome.storage.local.set as jest.Mock).mock.calls;
    expect(arg).toEqual({
      submissions: [
        { question: 'Name', answer: 'Alice' },
        { question: 'Email', answer: 'alice@example.com' },
      ],
    });
  });
});
