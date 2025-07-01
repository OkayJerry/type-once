// src/content/submitListener.ts

export function handleFormSubmit(form: HTMLFormElement) {
    // Define which input types we consider useful to save.
    const visibleInputTypes = new Set([
      'text', 'email', 'password', 'tel', 'url', 'number', 'search',
      'date', 'datetime-local', 'month', 'week', 'time'
    ]);
  
    // 1. Collect { question, answer } pairs from the current form submission
    const newSubmissions: { question: string; answer: string }[] = [];
    
    // Iterate through form elements instead of FormData to access input type.
    for (const element of Array.from(form.elements)) {
      const input = element as HTMLInputElement;
  
      // Skip buttons and non-input elements
      if (!(input.name && input.value)) continue;
  
      // Skip hidden fields and types we don't want to save
      if (input.type === 'hidden' || !visibleInputTypes.has(input.type)) continue;
  
      let question = input.name;
      if (input.labels?.length) {
        const label = input.labels[0].textContent?.trim();
        if (label) question = label;
      }
  
      newSubmissions.push({ question, answer: input.value });
    }
  
    if (newSubmissions.length === 0) {
      console.log("No new user-visible data found in this form to save.");
      return; // Don't save if we didn't find any useful data
    }
  
    // 2. Retrieve existing submissions, then update or insert new ones.
    chrome.storage.local.get('submissions', (data) => {
      const existingSubmissions = data.submissions || [];
      const submissionsMap = new Map(existingSubmissions.map((item: any) => [item.question, item.answer]));
  
      for (const submission of newSubmissions) {
          submissionsMap.set(submission.question, submission.answer);
      }
  
      const allSubmissions = Array.from(submissionsMap, ([question, answer]) => ({ question, answer }));
  
      chrome.storage.local.set({ submissions: allSubmissions }, () => {
        console.log('Submissions saved:', allSubmissions);
      });
    });
  }
