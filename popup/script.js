document.getElementById('summarizeBtn').addEventListener('click', async () => {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = "<em>Extracting text from page...</em>";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 1. Ask the Content Script to extract the text
  chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_CONTENT" }, (response) => {
    if (chrome.runtime.lastError || !response || !response.success) {
      outputDiv.innerText = "Error: Make sure you are on a standard webpage and refresh the tab.";
      return;
    }

    outputDiv.innerHTML = "<em>Text extracted! Asking the AI to summarize...</em>";

    // 2. Forward the extracted text to the Background Script
    chrome.runtime.sendMessage({ action: "SUMMARIZE_TEXT", text: response.text }, (aiResponse) => {
      if (chrome.runtime.lastError || !aiResponse || !aiResponse.success) {
        outputDiv.innerText = "Error: Failed to communicate with background worker.";
        return;
      }

      // 3. Format and display the final summary!
      const { bullets, insights, readingTime } = aiResponse.data;
      
      outputDiv.innerHTML = `
        <div style="margin-bottom: 10px;"><strong>⏱️ ${readingTime}</strong></div>
        <strong>Summary:</strong>
        <ul style="padding-left: 20px; margin-top: 5px;">
          ${bullets.map(b => `<li style="margin-bottom: 5px;">${b}</li>`).join('')}
        </ul>
        <strong>Key Insights:</strong>
        <p style="margin-top: 5px;">${insights}</p>
      `;
    });
  });
});