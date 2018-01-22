chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
        case "popup-click":
            console.log("message recieved from popup");
            chrome.tabs.executeScript(null, { // defaults to the current tab
                file: "content.js", // script to inject into page and run in sandbox
                allFrames: true // This injects script into iframes in the page and doesn't work before 4.0.266.0.
            });
            sendResponse({}); // sending back empty response to sender
            //break;
        case "got-video-id":
            console.log("background recieived message from content sccript");
            sendResponse({});
            //break;
        case "test":
            console.log("it works");
            break;
        default:
            // helps debug when request directive doesn't match
            alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);