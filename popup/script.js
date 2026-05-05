//  const { bullets, insights, readingTime } = aiResponse.data;
 

// document.getElementById('summarizeBtn').addEventListener('click', async () => {
//   const outputDiv = document.getElementById('output');
//   outputDiv.innerHTML = "<em>Extracting text from page...</em>";

//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   // 1. Ask the Content Script to extract the text
//   chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_CONTENT" }, (response) => {
//     if (chrome.runtime.lastError || !response || !response.success) {
//       outputDiv.innerText = "Error: Make sure you are on a standard webpage and refresh the tab.";
//       return;
//     }

//     outputDiv.innerHTML = "<em>Text extracted! Asking the AI to summarize...</em>";

//     // 2. Forward the extracted text to the Background Script
//     chrome.runtime.sendMessage({ action: "SUMMARIZE_TEXT", text: response.text }, (aiResponse) => {
//       if (chrome.runtime.lastError || !aiResponse || !aiResponse.success) {
//         outputDiv.innerText = "Error: Failed to communicate with background worker.";
//         return;
//       }

     
            
//             outputDiv.innerHTML = `
//               <div class="summary-time">
//                 <!-- Minimalist clock icon -->
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
//                 ${readingTime}
//               </div>
              
//               <strong>Summary</strong>
//               <ul>
//                 ${bullets.map(b => `<li>${b}</li>`).join('')}
//               </ul>
              
//               <div class="insights-section">
//                 <strong>Key Insights</strong>
//                 ${insights}
//               </div>
//             `;
//     });
//   });
// });
// 
document.getElementById('summarizeBtn').addEventListener('click', async () => {
  const outputDiv = document.getElementById('output');
  
  // 1. Show initial loading state
  outputDiv.innerHTML = "<em>Extracting text from page...</em>";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. Ask the Content Script to extract the text
    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_CONTENT" }, (response) => {
      
      if (chrome.runtime.lastError || !response || !response.success) {
        outputDiv.innerHTML = "<em>Error: Make sure you are on a standard webpage and refresh the tab.</em>";
        return;
      }

      // 3. Show AI loading state
      outputDiv.innerHTML = "<em>Text extracted! Asking the AI to summarize...</em>";

      // 4. Forward the extracted text to the Background Script
      chrome.runtime.sendMessage({ action: "SUMMARIZE_TEXT", text: response.text }, (aiResponse) => {
        
        if (chrome.runtime.lastError || !aiResponse || !aiResponse.success) {
          outputDiv.innerHTML = "<em>Error: Failed to communicate with background worker. Make sure your local server is running!</em>";
          return;
        }

        // 5. Format and display the final summary using our new Claude styling!
        const { bullets, insights, readingTime } = aiResponse.data;
        
        outputDiv.innerHTML = `
          <div class="summary-time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${readingTime}
          </div>
          
          <strong>Summary</strong>
          <ul>
            ${bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
          
          <div class="insights-section">
            <strong>Key Insights</strong>
            ${insights}
          </div>
        `;
      });
    });
  } catch (error) {
    outputDiv.innerHTML = "<em>An unexpected error occurred.</em>";
    console.error("Popup error:", error);
  }
});