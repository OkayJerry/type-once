// src/content/__tests__/fieldInjector.test.tsx

import { fireEvent, screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { injectIcons } from '../fieldInjector';
import { StorageService } from '../../services/storage';
import { findBestMatch } from '../../services/vectorSearch';

// Mock the services that our fieldInjector depends on.
jest.mock('../../services/storage');
jest.mock('../../services/vectorSearch');

// Create typed mocks for type-safe testing.
const mockedGetEntries = jest.mocked(StorageService.getEntries);
const mockedFindBestMatch = jest.mocked(findBestMatch);

describe('Icon Injection and Popup Interaction', () => {
  const selectedText = 'full legal name';
  const expectedAnswer = 'Jerry Hoskins';

  beforeEach(() => {
    jest.clearAllMocks();

    document.body.innerHTML = `
      <h1>Application Form</h1>
      <p>Please enter your ${selectedText} below.</p>
      <input type="text" id="username" value="${expectedAnswer}" />
    `;
    document.body.className = '';

    jest.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => selectedText,
      rangeCount: 1,
      getRangeAt: () => ({
        getBoundingClientRect: () => ({
          top: 50, left: 100, bottom: 70, right: 200, x: 100, y: 50, width: 100, height: 20,
        }),
      }),
    } as any);

    // --- Setup Service Mocks ---
    // Simulate having some entries in storage.
    mockedGetEntries.mockResolvedValue([
      { question: 'First Name', answer: 'Jerry', embedding: [1, 0, 0] },
    ]);
    // Simulate the vector search finding a best match.
    mockedFindBestMatch.mockResolvedValue({
      question: 'First Name',
      answer: 'Jerry',
      embedding: [1, 0, 0],
    });
    // --- End Service Mocks ---

    injectIcons();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the SuggestionPopup with correct question and answer after selection', async () => {
    const icon = document.querySelector<HTMLElement>('.type-once-icon');
    expect(icon).toBeTruthy();
    fireEvent.click(icon!);

    fireEvent.mouseUp(document.body);

    // Now that our services are mocked, the popup should receive the correct props.
    const questionNode = await screen.findByText('First Name');
    const answerNode = await screen.findByText('Jerry');

    expect(questionNode).toBeInTheDocument();
    expect(answerNode).toBeInTheDocument();
  });

  it('does not render the SuggestionPopup if not in highlighting mode', () => {
    fireEvent.mouseUp(document.body);
    expect(document.querySelector('.type-once-popup')).toBeNull();
  });
});
