var ytApiKey = "";
var youtubeApiUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=";
var videoId;
var videoTitle;

var geniusSearchUrl="https://api.genius.com/search?q=";
var geniusAccessToken = "";
var resultsLength;    //Number of results returned
var parsedResponse;   //Parsed version of response from Genius.com

var submitButtonHtml = "<form id=\"search\"><br><div><label for=\"searchBox\">Search</label><input type=\"text\" class=\"form-control\" id=\"searchBox\"></input></div><br><button id=\"hitSearch\" type=\"submit\" class=\"btn btn-secondary\">Submit</button><br><br></form>";


/**
Gets url from content.js
Gets title of video if youtube,
else notifies user of incompatibility
*/
chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {
    var url = tabs[0].url;
    if(url.substring(0,32) === "https://www.youtube.com/watch?v="){
      videoId = url.substring(32);
      getTitle(null);
    }
    else{
      displaySearchBar();
    }
});


/**
GETS video title from given videoId in url if string passed in is null,
else searches
@param string
*/
function getTitle(inputTitle){
  var youtubeApiReqUrl = youtubeApiUrl  + videoId + "&key=" + ytApiKey;

  if(inputTitle == null){
    $.ajax({
      type: "GET",
      url: youtubeApiReqUrl,
      dataType: "text",
      success: function(data){
        videoTitle = data;
        var obj = JSON.parse(videoTitle);
        videoTitle = obj.items[0].snippet.title;
        var songAndArtist = getSongAndArtist(videoTitle);
        searchGenius(songAndArtist);
      },
      error: function(xhr, ajaxOptions, thrownError){
        console.log(xhr.status);
        console.log(thrownError);
      }
    });
  }
  else{
    searchGenius(inputTitle);
  }
}

/**
Splits the Youtube Video Title into an artist and song title that is searchable
Removes any extraneous substrings
@param {string}
@return
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
    return vidTitle;
  }

}

/**
Call search function from Genius.com with given title
On success, calls function to display all the returned results
@param string
*/
function searchGenius(title){
  var query = title.replace(/\s/g,"%20");   //Replace all spaces with %20
  var geniusReqUrl = geniusSearchUrl + query;

  $.ajax({
    url: geniusReqUrl,
    type: "GET",
    beforeSend: function(xhr){xhr.setRequestHeader("Authorization","Bearer "+geniusAccessToken);},
    success: function(data){
      parsedResponse = data;
      response = parsedResponse.meta.status;
      resultsLength = parsedResponse.response.hits.length;
      displayResults();
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
      console.log(thrownError);
    }
  })
}

/**
Displays reusults depending on returned info
If 0 results return, inform user no results Found
If 1 result returned, display the lyrics of returned songAndArtist
Else, display all search results
*/
function displayResults(){
  if(resultsLength == 0){
    $("#content").html("<br<div class=\"container\"><p class=\"text-center\">No Results Found<p></div><div class=\"row\"><hr><button type=\"button\" class=\"btn btn-light btn-sm btn-block\" id=\"clickSearch\">Search</button></div>");
    $("#clickSearch").on("click",displaySearchBar);
  }
  else if(resultsLength > 1){
    var results = "<br><div class=\"row\"><div class=\"col-1 button-col\"><button type=\"button\" class=\"btn btn-light btn-sm\" id=\"clickSearch\">Search</button></div></div><hr>";
    results += "<div class=\"row\"><h3 class=\"text-center\">Results</h3></div>";
    var i;
    for(i=0;i<resultsLength;i++){
      var title = parsedResponse.response.hits[i].result.full_title;
      results += "<button type=\"button\" class=\"btn btn-secondary btn-block result\" id="+i+">"+title+"</button><br>";
    }
    $("#content").html(results);
    $(".result").on("click",function(){
      var resultId = $(this).attr("id");
      displayLyrics(parsedResponse.response.hits[resultId].result.path);
    });
    $("#clickSearch").on("click",displaySearchBar);
  }
  else{   //1 result displayed
    displayLyrics(parsedResponse.response.hits[0].result.path);
  }
}

/**
Displays lyrics based on given path
@param string
*/
function displayLyrics(path){
  var fullPath = "https://genius.com"+path;

  $.ajax({
    type: "GET" ,
    url: fullPath,
    dataType: 'text',
    success: function(data){
      var str = findLyrics(data);
      var backButton = "<button type=\"button\" class=\"btn btn-block back \">Back to Results</button>";
      var br = "<br>";
      while(str.indexOf("<a") != -1){   //Remove all the <a></a> tags, used for annotations
        var indexOfA = str.indexOf("<a");
        var toBeReplaced = str.substring(indexOfA,str.indexOf("\">",indexOfA)+2);
        str = str.replace(toBeReplaced,"");
        str = str.replace("</a>","");
      }

      str = br+backButton+br+str+br;
      $("#content").css("width","325px");
      $("#content").html(str);
      $(".back").on("click",function(){
        $("#content").css("width","");
        displayResults();
      });

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
      console.log(thrownError);
    }
  });
}

/**
Parses through response from song page on Genius to look for lyric tags
@param string
@return string
*/
function findLyrics(data){
  var lyrics = data.substring(data.indexOf("<div class=\"lyrics\">")+20);
  lyrics = lyrics.substring(0, lyrics.indexOf("</div>"));
  return lyrics;
}

/**
Displays Search Bar
*/
function displaySearchBar(){
  $("#content").html(submitButtonHtml);
  $("#search").submit(function(event){
    var title = $("#searchBox").val();
    getTitle(title);
    event.preventDefault();
  });
}
