document.addEventListener('DOMContentLoaded', () => {
    const linkList = document.getElementById('linkList');
    const defaultColorPicker = document.getElementById('defaultColorPicker');
    
    // Retrieve the saved default color or set to red initially
    chrome.storage.local.get({ defaultColor: '#ff0000', markedLinks: {} }, (result) => {
        defaultColorPicker.value = result.defaultColor;
        const markedLinks = result.markedLinks;
        linkList.innerHTML = ''; // Clear the list before populating
    
        // Display each marked link with a delete button and color picker
        Object.keys(markedLinks).forEach(linkUrl => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
    
            const linkElement = document.createElement('a');
            linkElement.href = linkUrl;
            linkElement.textContent = linkUrl;
            linkElement.target = '_blank'; // Open link in a new tab
    
            // Create a color picker for this link
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.value = markedLinks[linkUrl]; // Set color from storage
            colorPicker.addEventListener('input', () => {
                updateLinkColor(linkUrl, colorPicker.value);  // Update the color in storage
                sendColorUpdateToPage(linkUrl, colorPicker.value);  // Notify content script to update the color in real-time
            });
    
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                removeLink(linkUrl);  // Call function to remove the link
            });
    
            linkItem.appendChild(linkElement);
            linkItem.appendChild(colorPicker);
            linkItem.appendChild(deleteButton);
            linkList.appendChild(linkItem);
        });
    });
  
    // Update default color when changed
    defaultColorPicker.addEventListener('input', () => {
        const newDefaultColor = defaultColorPicker.value;
        chrome.storage.local.set({ defaultColor: newDefaultColor });
    });
});

// Function to update the color of a specific link in storage
function updateLinkColor(linkUrl, newColor) {
    chrome.storage.local.get({ markedLinks: {} }, (result) => {
        const markedLinks = result.markedLinks;
        markedLinks[linkUrl] = newColor;
        chrome.storage.local.set({ markedLinks });
    });
}

function sendColorUpdateToPage(linkUrl, newColor) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'updateLinkColor',
          linkUrl: linkUrl,
          newColor: newColor
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Could not send message to content script: ", chrome.runtime.lastError.message);
          } else {
            console.log("Message sent successfully to content script.");
          }
        });
      } else {
        console.error("No active tab found.");
      }
    });
  }
  
  

// Function to remove a link
function removeLink(linkUrl) {
    chrome.storage.local.get({ markedLinks: {} }, (result) => {
        const markedLinks = result.markedLinks;
        delete markedLinks[linkUrl];
        chrome.storage.local.set({ markedLinks }, () => {
            sendColorUpdateToPage(linkUrl, '');  // Notify the content script to remove the highlight
        });
    });
}
