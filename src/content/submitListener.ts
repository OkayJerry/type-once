// src/content/submitListener.ts

export function handleFormSubmit(form: HTMLFormElement) {
    // 1. Build a FormData object from the form :contentReference[oaicite:0]{index=0}
    const formData = new FormData(form);
  
    // 2. Collect { question, answer } pairs
    const submissions: { question: string; answer: string }[] = [];
    for (const [name, value] of formData.entries()) {          // Iterate all entries :contentReference[oaicite:1]{index=1}
      let question = name;
  
      // 3. Try to resolve a human‐readable label if one exists :contentReference[oaicite:2]{index=2}
      const input = form.elements.namedItem(name) as HTMLInputElement | null;
      if (input?.labels?.length) {                               // labels is a NodeList of associated <label>s :contentReference[oaicite:3]{index=3}
        const label = input.labels[0].textContent?.trim();
        if (label) question = label;
      }
  
      submissions.push({ question, answer: String(value) });
    }
  
    // 4. Persist locally via Chrome storage API :contentReference[oaicite:4]{index=4}
    chrome.storage.local.set({ submissions });
  }
  