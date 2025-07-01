// src/content/__tests__/SuggestionPopup.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuggestionPopup } from '../SuggestionPopup';
import type { SuggestionPopupProps } from '../SuggestionPopup';

describe('SuggestionPopup', () => {
  const mockOnFill = jest.fn();
  const mockOnSaveNew = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps: SuggestionPopupProps = {
    top: 100,
    left: 150,
    suggestedQuestion: 'Email Address',
    suggestedAnswer: 'test@example.com',
    onFill: mockOnFill,
    onSaveNew: mockOnSaveNew,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with the given props', () => {
    render(<SuggestionPopup {...defaultProps} />);

    // The prefix text
    expect(
      screen.getByText('This looks similar to', { exact: false })
    ).toBeInTheDocument();

    // The <strong> child
    expect(screen.getByText(defaultProps.suggestedQuestion)).toBeInTheDocument();

    // The answer prefix
    expect(
      screen.getByText('Fill with your saved answer:', { exact: false })
    ).toBeInTheDocument();

    // The <em> child
    expect(screen.getByText(defaultProps.suggestedAnswer)).toBeInTheDocument();
  });

  it('calls onFill when the "Fill with this Answer" button is clicked', () => {
    render(<SuggestionPopup {...defaultProps} />);
    fireEvent.click(
      screen.getByRole('button', { name: /Fill with this Answer/i })
    );
    expect(mockOnFill).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveNew when the "Save as New" button is clicked', () => {
    render(<SuggestionPopup {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Save as New/i }));
    expect(mockOnSaveNew).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close (×) button is clicked', () => {
    render(<SuggestionPopup {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/Close/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
