// src/content/__tests__/SuggestionPopup.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuggestionPopup } from '../SuggestionPopup';
import type { SuggestionPopupProps } from '../SuggestionPopup';

describe('SuggestionPopup', () => {
  const mockOnFill = jest.fn();
  const mockOnSaveNew = jest.fn();
  const mockOnClose = jest.fn();

  const propsWithSuggestion: SuggestionPopupProps = {
    top: 100,
    left: 150,
    suggestedQuestion: 'Email Address',
    suggestedAnswer: 'test@example.com',
    onFill: mockOnFill,
    onSaveNew: mockOnSaveNew,
    onClose: mockOnClose,
  };

  const propsWithoutSuggestion: SuggestionPopupProps = {
    top: 100,
    left: 150,
    onFill: mockOnFill,
    onSaveNew: mockOnSaveNew,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when a suggestion is provided', () => {
    render(<SuggestionPopup {...propsWithSuggestion} />);
    expect(screen.getByText(/This looks similar to/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fill with this Answer/i })).toBeInTheDocument();
  });

  it('renders correctly when NO suggestion is provided', () => {
    render(<SuggestionPopup {...propsWithoutSuggestion} />);
    expect(screen.getByText(/No similar entry found/i)).toBeInTheDocument();
    // The "Fill" button should not be present
    expect(screen.queryByRole('button', { name: /Fill with this Answer/i })).toBeNull();
    // The "Save" button should still be present
    expect(screen.getByRole('button', { name: /Save as New Entry/i })).toBeInTheDocument();
  });

  it('calls onFill when the "Fill" button is clicked', () => {
    render(<SuggestionPopup {...propsWithSuggestion} />);
    fireEvent.click(screen.getByRole('button', { name: /Fill with this Answer/i }));
    expect(mockOnFill).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveNew when the "Save as New" button is clicked', () => {
    render(<SuggestionPopup {...propsWithSuggestion} />);
    fireEvent.click(screen.getByRole('button', { name: /Save as New Entry/i }));
    expect(mockOnSaveNew).toHaveBeenCalledTimes(1);
  });
});
