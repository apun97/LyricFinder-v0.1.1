chrome.runtime.sendMessage({directive: "test"}, function(response) {
  console.log("message sent from content script from test");
});
var url = location.href;
if(url.substring(0,29) === "https://www.youtube.com/watch"){
  chrome.runtime.sendMessage({directive: "got-video-id"}, function(response) {
    console.log("message sent from content script");
  });
}

/*
var ytApiKey = "AIzaSyBllf9AvcRCTKyJDydluqwvs_5mP_3nTxk	";


console.log(url);
if(url.substring(0,29) === "https://www.youtube.com/watch"){
  var videoId = url.substring(29);
  document.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + ytApiKey, function(data) {
    alert(data.items[0].snippet.title);
  });
}
*/
