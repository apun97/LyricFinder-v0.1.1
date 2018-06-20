/*
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
            break;
        default:
            // helps debug when request directive doesn't match
            //alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
            if(request.directive.substring(0,32) === "https://www.youtube.com/watch?v="){
                var videoId = request.directive.substring(32);
                getTitle(videoId);
            }
        }
    }
);

var ytApiKey = "AIzaSyBllf9AvcRCTKyJDydluqwvs_5mP_3nTxk	";
var youtubeApiUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=";

function getTitle(videoId){
  var youtubeApiReqUrl = youtubeApiUrl  + videoId + "&key=" + ytApiKey;
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function(){
    if(xhttp.readyState == XMLHttpRequest.DONE){

    }
  }
  xhttp.open("GET",youtubeApiReqUrl,true);
  send();
  var title = xhttp.responseText;
  console.log(title);
}
*/
