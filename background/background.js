// background/background.js

// Listen for messages coming from the Popup UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SUMMARIZE_PAGE") {
        
        // Because making an API call takes time, we must return `true` 
        // to tell Chrome we will send the response asynchronously.
        handleSummarize(request.text, request.url).then(sendResponse);
        return true; 
    }
});

/**
 * Handles the logic of checking the cache, calling the local server, and saving the result.
 */
async function handleSummarize(textToSummarize, pageUrl) {
    try {
        // 1. Check the cache first (Fulfilling your TRD requirement)
        const cacheKey = `summary_${pageUrl}`;
        const cachedResult = await chrome.storage.local.get(cacheKey);
        
        if (cachedResult[cacheKey]) {
            console.log("Summary found in cache! Skipping API call.");
            return { success: true, data: cachedResult[cacheKey] };
        }

        // 2. If not cached, send the text to your newly running local server
        const response = await fetch('http://localhost:3000/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ textToSummarize: textToSummarize })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        // 3. Save the fresh summary to the cache for future use
        await chrome.storage.local.set({ [cacheKey]: data });

        // 4. Send the data back to the popup
        return { success: true, data: data };

    } catch (error) {
        console.error("Background Fetch Error:", error);
        return { success: false, error: error.message };
    }
}