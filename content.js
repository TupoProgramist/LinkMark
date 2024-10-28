chrome.storage.local.get({ markedLinks: {} }, (result) => {
    const markedLinks = result.markedLinks;

    Object.keys(markedLinks).forEach((linkUrl) => {
        const frameColor = markedLinks[linkUrl];

        // Select both direct links and those embedded in child elements
        const links = document.querySelectorAll(`a[href='${linkUrl}'], button[href='${linkUrl}'], a[href*='${linkUrl}'], button[href*='${linkUrl}']`);
        
        links.forEach((link) => {
            link.style.border = `2px solid ${frameColor}`;  // Apply the saved color
        });
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateLinkColor') {
      const links = document.querySelectorAll(`a[href='${message.linkUrl}'], button[href='${message.linkUrl}'], a[href*='${message.linkUrl}'], button[href*='${message.linkUrl}']`);
  
      if (links.length === 0) {
        console.error("No matching links found for URL:", message.linkUrl);
      } else {
        links.forEach((link) => {
          link.style.border = `2px solid ${message.newColor}`;  // Update the border color
        });
      }
    }
  });
  