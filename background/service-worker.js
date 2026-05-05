// background/service-worker.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SUMMARIZE_TEXT") {
    console.log("Background received text. Length:", request.text.length);

    // Make a network request to your local proxy server
    fetch('http://localhost:3001/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the extracted text exactly how your Express req.body expects it
      body: JSON.stringify({ textToSummarize: request.text }) 
    })
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      console.log("Received data from proxy:", data);
      
      // Map the server's response to the structure our Popup UI expects
      const formattedData = {
              readingTime: data.readingTime,
              bullets: data.summary, 
              insights: data.insights 
            };

      // Send the data back to the popup!
      sendResponse({ success: true, data: formattedData });
    })
    .catch(error => {
      console.error("Error connecting to proxy server:", error);
      sendResponse({ success: false, error: "Could not connect to proxy server." });
    });

    // Return true to tell Chrome we will send the response asynchronously
    return true; 
  }
});