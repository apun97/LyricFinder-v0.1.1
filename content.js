/**
If youtube url, send url as message
*/
var url = location.href;
if(url.substring(0,29) === "https://www.youtube.com/watch"){
  chrome.runtime.sendMessage({directive: url}, function(response){
  });
}
