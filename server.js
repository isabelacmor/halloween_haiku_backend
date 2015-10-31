var io = require('socket.io')(80);
var cfg = require('./config.json');
var tw = require('node-tweet-stream')(cfg);
var syllable = require('syllable');
var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

var tweetWith5 = {};
var tweetWith7 = {};

tw.track('#halloween');
tw.on('tweet', function(tweet){
  io.emit('tweet', tweet.text);
  var trimmedTweet = trimTweet(" " + tweet.text);
  var syl = getSyllables(trimmedTweet);
  if(!trimmedTweet.match(/\s+RT\s+|[0-9]/g)){
    if(syl == 5){
      tweetWith5.tweet = trimmedTweet.trim();
      tweetWith5.url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
      // console.log(tweetWith5);
    }else if (syl == 7) {
      tweetWith7.tweet = trimmedTweet.trim();
      tweetWith7.url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
      // console.log(tweetWith7);
    }
  }
});

function trimTweet(text){

  //remove links
  var noLinks = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  text = text.replace(noLinks, "");

  //remove non alphanumeric chars
  text = text.replace(/[\W_]/g, ' ');

  //remove extra whitespace
  text = text.replace(/\s\s+/g, ' ');
  return text;
}

function getSyllables(str){
  var count = 0;

  var arr = str.split(" ");

  arr.forEach(function(s){
    count += syllable(s);
  });

  return count;
}

function getDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  }

  if(mm<10) {
      mm='0'+mm
  }

  today = mm+'/'+dd+'/'+yyyy;
  return today;
}

function start(){
  setTimeout(function(){
    var data = {
      tweetWith5:tweetWith5,
      tweetWith7:tweetWith7,
      today:getDate()
    }
    console.log(data);

    redis.rpush("haikus", JSON.stringify(data), function(){
      console.log(data);
    });
    start();
  }, 30000);
}
start();
