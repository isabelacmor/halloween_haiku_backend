var io = require('socket.io')(80);
var cfg = require('./config.json');
var tw = require('node-tweet-stream')(cfg);
var syllable = require('syllable');
tw.track('#halloween');
tw.on('tweet', function(tweet){
  io.emit('tweet', tweet.text);
  var trimmedTweet = trimTweet(" " + tweet.text);
  var syl = getSyllables(trimmedTweet);
  if((syl == 5 || syl == 7) && !trimmedTweet.match(/\s+RT\s+|[0-9]/g))
    console.log(trimmedTweet);
    // console.log(tweet);
});

function trimTweet(text){

  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  text = text.replace(regex, "");
  text = text.replace(/[\W_]/g, ' ');
  text = text.replace(/\s\s+/g, ' ');
  // text = text.replace(new RegExp("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)"), " ");
  text = text.replace(new RegExp("[^\x00-\x7F]+"), " ");
  return text = text.replace(new RegExp("[^\u0000-\u007F]+"), " ");
  //console.log("wow:" + text);
  //return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)"," ",text).split())
}

function getSyllables(str){
  var count = 0;

  var arr = str.split(" ");

  arr.forEach(function(s){
    count += syllable(s);
  });

  return count;
}
// var test = trimTweet("My halloween game face");
// console.log(test);
// console.log(getSyllables(trimTweet("My halloween game face")));
