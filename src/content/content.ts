// src/content/content.ts
import { injectIcons } from './fieldInjector';

// When the page is idle, inject our icons into the form fields.
// We no longer listen for submit events.
window.addEventListener('load', () => {
  injectIcons();
});
