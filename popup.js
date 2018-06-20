var ytApiKey = "AIzaSyBllf9AvcRCTKyJDydluqwvs_5mP_3nTxk";
var youtubeApiUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=";
var videoId;
var videoTitle;

var geniusSearchUrl="https://api.genius.com/search?q=";
var geniusAccessToken = "whTXJG08rGV-pvo65MGB4IS3zK4Hf-MsQUM0up1Lzdm-Rn33qrE1ffhmwSwt2xyw";

var resultsLength;

var obj;


chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url;
    if(url.substring(0,32) === "https://www.youtube.com/watch?v="){
      videoId = url.substring(32);
      document.getElementById("run").disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var runButton = document.getElementById('run')
    runButton.addEventListener('click', getTitle);
})


function getTitle(){
  $("#run").hide();
  var youtubeApiReqUrl = youtubeApiUrl  + videoId + "&key=" + ytApiKey;
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function(){
    if(xhttp.readyState == XMLHttpRequest.DONE){
      videoTitle = xhttp.responseText;
      var obj = JSON.parse(videoTitle);
      videoTitle = obj.items[0].snippet.title;
      var yeet = getSongAndArtist(videoTitle);
      searchGenius(yeet);
    }
  }
  xhttp.open("GET",youtubeApiReqUrl,true);
  xhttp.send();

}

/**
Splits the Youtube Video Title into an artist and song title that is searchable
Removes any extraneous substrings
@param {string}

*/
function getSongAndArtist(vidTitle){

  if(vidTitle.indexOf("-")>-1){
    var song;
    var artist;

    var str = vidTitle.split("-");
    artist = str[0];
    song = str[1];

    artist = artist.replace(/\([^)]*\)/g,"");         //( ... )
    artist = artist.replace(/\[.*\]/g,"");            //[ ...]
    artist = artist.replace(/\s(x|X)\s*/g,"");        // ... x ...
    artist = artist.replace(/\|.*/g,"");              // ... | ....
    artist = artist.replace(/ *,.*/g,"");             // ..., ..., ...
    artist = artist.replace(/ft\..*/g,"");            //... ft. ...
    artist = artist.replace(/feat\..*/g,"");          //... feat. ...
    artist = artist.replace(/(f|F)eaturing.*/g,"");   //... featuring ....

    song = song.replace(/\([^)]*\)/g,"");         //( ... )
    song = song.replace(/\[.*\]/g,"");            //[ ...]
    song = song.replace(/\s(x|X)\s*/g,"");        // ... x ...
    song = song.replace(/\|.*/g,"");              // ... | ....
    song = song.replace(/ *,.*/g,"");             // ..., ..., ...
    song = song.replace(/ft\..*/g,"");            //... ft. ...
    song = song.replace(/feat\..*/g,"");          //... feat. ...
    song = song.replace(/(f|F)eaturing.*/g,"");   //... featuring ....

    console.log(artist+" "+song);
    return artist+song;
  }
  else{
    vidTitle = vidTitle.replace(/\([^)]*\)/g,"");         //( ... )
    vidTitle = vidTitle.replace(/\[.*\]/g,"");            //[ ...]
    vidTitle = vidTitle.replace(/\s(x|X)\s*/g,"");        // ... x ...
    vidTitle = vidTitle.replace(/\|.*/g,"");              // ... | ....
    vidTitle = vidTitle.replace(/ *,.*/g,"");             // ..., ..., ...
    vidTitle = vidTitle.replace(/ft\..*/g,"");            //... ft. ...
    vidTitle = vidTitle.replace(/feat\..*/g,"");          //... feat. ...
    vidTitle = vidTitle.replace(/(f|F)eaturing.*/g,"");   //... featuring ....
    console.log(vidTitle);
    return vidTitle;
  }

}

function searchGenius(title){
  var query = title.replace(/\s/g,"%20");
  var geniusReqUrl = geniusSearchUrl + query;
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function(){
    if(xhttp.readyState == XMLHttpRequest.DONE){
      var response = xhttp.responseText;
      obj = JSON.parse(response);
      response = obj.meta.status;
      resultsLength = obj.response.hits.length;
      console.log(resultsLength);
      displayResults();
    }
  }
  xhttp.open("GET",geniusReqUrl,true);
  xhttp.setRequestHeader("Authorization","Bearer "+geniusAccessToken);
  xhttp.send();
}

function displayResults(){
  if(resultsLength == 0){
    document.getElementById("content").innerHTML = "<p>No Results Found</p>";
  }
  else if(resultsLength >1){

    var i;
    var results = "";
    for(i=0;i<resultsLength;i++){
      var title = obj.response.hits[i].result.full_title;
      console.log(title);
      results += "<p type=\"button\" class=\"result\" id="+i+">"+title+"</p><br>";
    }
    $("#content").html(results);
    $(".result").on("click",function(){
      var resultId = $(this).attr("id");
      displayLyrics(obj.response.hits[resultId].result.path);
    });
  }
  else{
    displayLyrics(obj.response.hits[0].result.path);
  }
}

function displayLyrics(path){
  var fullPath = "https://genius.com"+path;

  $.ajax({
    type: "GET" ,
    url: fullPath,
    dataType: 'text',
    success: function(data){
      var str = findLyrics(data);
      var backButton = "<button type=\"button\" class=\"back\">Back to Results</button>";
      var br = "<br>";
      while(str.indexOf("<a") != -1){
        var indexOfA = str.indexOf("<a");
        var toBeReplaced = str.substring(indexOfA,str.indexOf("\">",indexOfA)+2);
        str = str.replace(toBeReplaced,"");
        str = str.replace("</a>","");
      }

      str = backButton+str+br+br;
      $("#content").html(str);
      $(".back").on("click",function(){
        displayResults();
      });

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
      console.log(thrownError);
    }
  });
}


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}


function findLyrics(data){
  var lyrics = data.substring(data.indexOf("<div class=\"lyrics\">")+20);
  lyrics = lyrics.substring(0, lyrics.indexOf("</div>"));
  return lyrics;
}
