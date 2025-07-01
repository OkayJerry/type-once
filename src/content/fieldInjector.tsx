// src/content/fieldInjector.tsx

import { createRoot, Root } from 'react-dom/client';
import { SuggestionPopup, SuggestionPopupProps } from './SuggestionPopup';

let activeField: HTMLInputElement | HTMLTextAreaElement | null = null;
let popupContainer: HTMLDivElement | null = null;
let root: Root | null = null;

/**
 * Renders the SuggestionPopup component.
 */
export function renderSuggestionPopup(
  props: Omit<SuggestionPopupProps, 'onFill' | 'onSaveNew' | 'onClose'> & {
    newQuestion: string;
    activeField: HTMLInputElement | HTMLTextAreaElement;
  }
) {
  // Unmount any existing popup
  if (root && popupContainer) {
    root.unmount();
    popupContainer.remove();
  }

  popupContainer = document.createElement('div');
  document.body.appendChild(popupContainer);
  root = createRoot(popupContainer);

  const handleFill = () => {
    props.activeField.value = props.suggestedAnswer;
    closePopup();
  };

  const handleSaveNew = () => {
    console.log(
      `Saving new entry: { question: "${props.newQuestion}", answer: "${props.activeField.value}" }`
    );
    closePopup();
  };

  const closePopup = () => {
    if (root && popupContainer) {
      root.unmount();
      popupContainer.remove();
      popupContainer = null;
      root = null;
    }
    exitHighlightingMode();
  };

  root.render(
    <SuggestionPopup
      {...props}
      onFill={handleFill}
      onSaveNew={handleSaveNew}
      onClose={closePopup}
    />
  );
}

/**
 * Called on mouseup after highlighting mode is active.
 */
function handleSelection() {
  const selection = window.getSelection();
  const newQuestion = selection?.toString().trim() || '';
  if (!newQuestion || !activeField || !selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // --- simulate vector search result ---
  const { question: suggestedQuestion, answer: suggestedAnswer } = {
    question: 'First Name',
    answer: 'Jerry',
  };
  // ----------------------------------------

  renderSuggestionPopup({
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    newQuestion,
    suggestedQuestion,
    suggestedAnswer,
    activeField,
  });
}

/**
 * Begins highlighting mode on the given field.
 */
function enterHighlightingMode(field: HTMLInputElement | HTMLTextAreaElement) {
  activeField = field;
  document.body.classList.add('type-once-highlighting');
  document.addEventListener('mouseup', handleSelection, { once: true });
  console.log('Entered highlighting mode.');
}

/**
 * Exits highlighting mode.
 */
function exitHighlightingMode() {
  activeField = null;
  document.body.classList.remove('type-once-highlighting');
  console.log('Exited highlighting mode.');
}

/**
 * Click handler for the injected icon.
 */
function handleIconClick(field: HTMLInputElement | HTMLTextAreaElement) {
  if (document.body.classList.contains('type-once-highlighting')) {
    exitHighlightingMode();
  } else {
    enterHighlightingMode(field);
  }
}

/**
 * Finds all text inputs and textareas and injects a clickable icon.
 */
export function injectIcons() {
  const fields = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement
  >(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea'
  );

  fields.forEach((field) => {
    if (field.parentElement?.classList.contains('type-once-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'type-once-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    field.parentNode!.insertBefore(wrapper, field);
    wrapper.appendChild(field);

    const icon = document.createElement('span');
    icon.className = 'type-once-icon';
    icon.style.position = 'absolute';
    icon.style.right = '10px';
    icon.style.top = '50%';
    icon.style.transform = 'translateY(-50%)';
    icon.style.cursor = 'pointer';
    icon.innerText = '✨';

    icon.addEventListener('click', () => handleIconClick(field));
    wrapper.appendChild(icon);
  });
}
