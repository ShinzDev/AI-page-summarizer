chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_CONTENT") {
    try {
      // 1. A safer way to clone the page: turn the whole HTML into a string, then parse it back into a new document.
      const clone = new DOMParser().parseFromString(document.documentElement.outerHTML, "text/html");
      
      // 2. Initialize Readability on the safe clone
      const reader = new Readability(clone);
      const article = reader.parse();
      
      if (article) {
        sendResponse({ 
          success: true, 
          title: article.title,
          text: article.textContent,
          length: article.textContent.length 
        });
      } else {
        sendResponse({ success: false, error: "Could not find a readable article." });
      }
    } catch (error) {
      // THIS is where the hidden error gets logged!
      console.error("Extraction error:", error); 
      sendResponse({ success: false, error: "An error occurred during extraction." });
    }
  }
  return true; 
});