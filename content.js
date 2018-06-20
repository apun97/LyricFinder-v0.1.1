var url = location.href;
if(url.substring(0,29) === "https://www.youtube.com/watch"){
  chrome.runtime.sendMessage({directive: url}, function(response){
    
  });
}


/*



console.log(url);
if(url.substring(0,29) === "https://www.youtube.com/watch"){
  var videoId = url.substring(29);
  document.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + ytApiKey, function(data) {
    alert(data.items[0].snippet.title);
  });
}
*/
