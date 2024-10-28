chrome.storage.local.get({ markedLinks: {} }, (result) => {
    const markedLinks = result.markedLinks;
  
    Object.keys(markedLinks).forEach((linkUrl) => {
      const frameColor = markedLinks[linkUrl];
      const links = document.querySelectorAll(`a[href='${linkUrl}']`);
      links.forEach((link) => {
        link.style.border = `2px solid ${frameColor}`;
        link.style.padding = "2px";
      });
    });
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'highlightLink') {
      console.log(`Highlighting link: ${message.linkUrl}`);
  
      const urlObject = new URL(message.linkUrl, window.location.href);
      const relativePath = urlObject.pathname + urlObject.search;
      const links = document.querySelectorAll(`a[href='${message.linkUrl}'], a[href='${relativePath}']`);
  
      if (links.length === 0) {
        console.error(`No matching links found for URL: ${message.linkUrl}`);
      } else {
        links.forEach((link) => {
          link.style.border = `2px solid ${message.color}`;
          link.style.padding = "2px";
          console.log(`Link styled: ${link.href}`);
        });
      }
    }
  });
  