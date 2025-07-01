// src/content/content.ts
import { handleFormSubmit } from './submitListener';

// Listen in the capture phase to catch submits before page navigation :contentReference[oaicite:2]{index=2}
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form instanceof HTMLFormElement) {
    // Delegate to your tested handler :contentReference[oaicite:3]{index=3}
    handleFormSubmit(form);
  }
}, true);
