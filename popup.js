function clickHandler(e) {
    chrome.runtime.sendMessage({directive: "popup-click"}, function(response) {
      console.log("message sent to background");
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var runButton = document.getElementById('run')
    runButton.addEventListener('click', clickHandler);
})
