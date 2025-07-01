// src/content/__tests__/fieldInjector.test.tsx

import { fireEvent, screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { injectIcons } from '../fieldInjector';

describe('Icon Injection and Popup Interaction', () => {
  const selectedText = 'full legal name';
  const expectedAnswer = 'Jerry Hoskins';

  beforeEach(() => {
    jest.clearAllMocks();

    // Minimal page with one input
    document.body.innerHTML = `
      <h1>Application Form</h1>
      <p>Please enter your ${selectedText} below.</p>
      <input type="text" id="username" value="${expectedAnswer}" />
    `;
    document.body.className = '';

    // Stub window.getSelection() to return our question
    jest.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => selectedText,
      rangeCount: 1,
      getRangeAt: () => ({
        getBoundingClientRect: () => ({
          top: 50,
          left: 100,
          bottom: 70,
          right: 200,
          x: 100,
          y: 50,
          width: 100,
          height: 20,
        }),
      }),
    } as any);

    // Inject the icon so our click/mouseup handlers are wired
    injectIcons();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('renders the SuggestionPopup with correct question and answer after selection', async () => {
    // 1) Click the icon to enter highlighting mode
    const icon = document.querySelector<HTMLElement>('.type-once-icon');
    expect(icon).toBeTruthy();
    fireEvent.click(icon!);

    // 2) Simulate the user releasing the mouse (triggers renderSelection)
    fireEvent.mouseUp(document.body);

    // 3) Now the popup should render the suggested question & answer
    const questionNode = await screen.findByText('First Name');
    const answerNode   = await screen.findByText('Jerry');

    expect(questionNode).toBeInTheDocument();
    expect(answerNode).toBeInTheDocument();
  });

  it('does not render the SuggestionPopup if not in highlighting mode', () => {
    // Mouse up without clicking the icon
    fireEvent.mouseUp(document.body);

    expect(document.querySelector('.type-once-popup')).toBeNull();
  });
});
