let socket: WebSocket;

export function connectWebSocket() {
  socket = new WebSocket('ws://5.104.81.194:5000');

  socket.onopen = () => {
    console.log('WebSocket connection opened');
  };

  socket.onmessage = (event) => {
    // console.log('Message from server:', event.data);
    chrome.runtime.sendMessage(event.data)
    chrome.action.setIcon({ path: 'icons/socket-active.png' });
    chrome.tabs.query({ url: 'https://1xbet.com/en/allgamesentrance/crash/*' }, (tabs: any[]) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { message: event.data });
      }
    });
  };

  socket.onclose = (event) => {
    console.log('WebSocket connection closed:', event);
    chrome.action.setIcon({ path: 'icons/socket-inactive.png' });
    setTimeout(connectWebSocket, 1000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
} 

connectWebSocket();




// chrome.scripting
//   .registerContentScripts([{
//     id: "session-script",
//     js: ["content.js"],
//     persistAcrossSessions: false,
//     matches: ["<all_urls>"],
//     runAt: "document_start",
//   }])
//   .then(() => console.log("registration complete"))
//   .catch((err) => console.warn("unexpected error", err))

  chrome.scripting
  .getRegisteredContentScripts()
  .then(scripts => console.log("registered content scripts", scripts));

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   
    socket.send(request)
  })
      


    


  // chrome.action.onClicked.addListener((tab:any) => {
  //   chrome.scripting.executeScript({
  //     target: { tabId: tab.id },
  //     files: ["content.js"]
  //   });
  // });

  // function getCurrentTab(callback:any) {
  //   let queryOptions = { active: true, lastFocusedWindow: true };
  //   chrome.tabs.query(queryOptions, ([tab]) => {
  //     if (chrome.runtime.lastError)
  //     console.error(chrome.runtime.lastError);
  //     // `tab` will either be a `tabs.Tab` instance or `undefined`.
  //     callback(tab);
  //   });
  // }

  // chrome.tabs.query({ url: 'https://github.com/*' }, function(tabs) { });