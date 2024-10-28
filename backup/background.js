chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "markLink",
      title: "Mark Link",
      contexts: ["link"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const linkUrl = info.linkUrl;
  
    chrome.storage.local.get({ markedLinks: {} }, (result) => {
      const markedLinks = result.markedLinks;
  
      if (!markedLinks[linkUrl]) {
        chrome.storage.local.get({ defaultColor: '#ff0000' }, (result) => {
          const defaultColor = result.defaultColor;
          markedLinks[linkUrl] = defaultColor;
          chrome.storage.local.set({ markedLinks }, () => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },  // Use tab.id directly here
              function: (linkUrl, frameColor) => {
                const urlObject = new URL(linkUrl, window.location.href);
                const relativePath = urlObject.pathname + urlObject.search;
                const links = document.querySelectorAll(`a[href='${linkUrl}'], a[href='${relativePath}']`);
                links.forEach((link) => {
                  link.style.border = `2px solid ${frameColor}`;
                  link.style.padding = "2px";
                });
              },
              args: [linkUrl, defaultColor]
            });
          });
        });
      } else {
        // Send message to the content script to ask for confirmation
        chrome.tabs.sendMessage(tab.id, {  // Use tab.id directly here
          action: 'confirmChangeOrUnmark',
          linkUrl: linkUrl
        });
      }
    });
  });
  
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'changeLinkColor') {
      chrome.storage.local.get({ defaultColor: '#ff5733', markedLinks: {} }, (result) => {
        const markedLinks = result.markedLinks;
        const defaultColor = result.defaultColor;
  
        markedLinks[message.linkUrl] = defaultColor;
        chrome.storage.local.set({ markedLinks }, () => {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                function: (linkUrl, newColor) => {
                  console.log(`Executing script to highlight link: ${linkUrl}`);
                  const urlObject = new URL(linkUrl, window.location.href);
                  const relativePath = urlObject.pathname + urlObject.search;
                  const links = document.querySelectorAll(`a[href='${linkUrl}'], a[href='${relativePath}']`);
                  links.forEach((link) => {
                    link.style.border = `2px solid ${newColor}`;
                    link.style.padding = "2px";
                  });
                },
                args: [message.linkUrl, defaultColor]
              });
              
        });
      });
    } else if (message.action === 'unmarkLink') {
      chrome.storage.local.get({ markedLinks: {} }, (result) => {
        const markedLinks = result.markedLinks;
        delete markedLinks[message.linkUrl];
        chrome.storage.local.set({ markedLinks }, () => {
          chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            function: (linkUrl) => {
              const links = document.querySelectorAll(`a[href='${linkUrl}']`);
              links.forEach((link) => {
                link.style.border = '';
                link.style.padding = '';
              });
            },
            args: [message.linkUrl]
          });
        });
      });
    }
  });
  