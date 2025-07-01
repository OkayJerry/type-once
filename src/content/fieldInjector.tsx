import { createRoot, Root } from 'react-dom/client';
import { SuggestionPopup, SuggestionPopupProps } from './SuggestionPopup';
import { StorageService } from '../services/storage';
import { findBestMatch } from '../services/vectorSearch';

let activeField: HTMLInputElement | HTMLTextAreaElement | null = null;
let popupContainer: HTMLDivElement | null = null;
let root: Root | null = null;

export function renderSuggestionPopup(
  props: Omit<SuggestionPopupProps, 'onFill' | 'onSaveNew' | 'onClose'> & {
    newQuestion: string;
    activeField: HTMLInputElement | HTMLTextAreaElement;
  }
) {
  if (popupContainer && root) {
    root.unmount();
    popupContainer.remove();
  }

  popupContainer = document.createElement('div');
  document.body.appendChild(popupContainer);
  root = createRoot(popupContainer);

  const handleFill = () => {
    if (props.suggestedAnswer) {
      props.activeField.value = props.suggestedAnswer;
    }
    closePopup();
  };

  const handleSaveNew = async () => {
    await StorageService.addEntry(props.newQuestion, props.activeField.value);
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

async function handleSelection() {
  const selection = window.getSelection();
  const newQuestion = selection?.toString().trim();

  if (newQuestion && activeField && selection?.rangeCount) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Try the real vector-search integration
    const storedEntries = await StorageService.getEntries();
    const bestMatch = await findBestMatch(newQuestion, storedEntries);

    // If no match, but the user selected "full ... name", suggest "First Name"
    let suggestedQuestion: string | undefined = bestMatch?.question;
    let suggestedAnswer: string | undefined = bestMatch?.answer;
    if (!bestMatch) {
      const words = newQuestion.split(' ');
      if (words[0].toLowerCase() === 'full' && words.length >= 2) {
        const lastWord = words[words.length - 1];
        // e.g. 'full legal name' → 'First Name'
        suggestedQuestion =
          'First ' + lastWord.charAt(0).toUpperCase() + lastWord.slice(1);
        // e.g. 'Jerry Hoskins' → 'Jerry'
        suggestedAnswer = activeField.value.split(' ')[0];
      }
    }

    renderSuggestionPopup({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      newQuestion,
      suggestedQuestion,
      suggestedAnswer,
      activeField,
    });

    exitHighlightingMode();
  }
}

function enterHighlightingMode(field: HTMLInputElement | HTMLTextAreaElement) {
  activeField = field;
  document.body.classList.add('type-once-highlighting');
  document.addEventListener('mouseup', handleSelection, { once: true });
}

function exitHighlightingMode() {
  activeField = null;
  document.body.classList.remove('type-once-highlighting');
}

function handleIconClick(field: HTMLInputElement | HTMLTextAreaElement) {
  if (document.body.classList.contains('type-once-highlighting')) {
    exitHighlightingMode();
  } else {
    enterHighlightingMode(field);
  }
}

export function injectIcons() {
  const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
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
