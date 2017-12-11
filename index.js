/**
 * Base code from tutorial: https://socket.io/get-started/chat/
 * Author: Donovan Troshynski
 * Improvements:
 * Broadcast a message to connected users when someone connects or disconnects
 * Add support for nicknames
 * Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
 * Add “{user} is typing” functionality
 * Show who’s online
 * Add private messaging
 * "Waiting for chat partner..." -> "Chat Partner found"
 */
/**
 * To Fix:
 * Chat box appearing on correct side of page based on which user it is
 */

let express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Engine = require('tingodb')();
var path = require("path");
var randomColor = require('randomcolor'); // import the script

var db = new Engine.Db('tingo', {});
var users = db.collection("users");

http.listen("80", "0.0.0.0", 10000, function() {
  console.log('connected');
});
// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });
app.set('view engine', 'ejs');

app.get('/signup', function(req, res){

    var userName = req.query.userName;
    var password = req.query.password;
    var confirm = req.query.confirm;
    var userNameTaken = false;

    //Check to make sure it's valid -- valid email, passwords match, and nothing blank
    if(password != confirm) {
        res.render("error.ejs", {error: "Passwords don't match"});
    }
    if(!userName) {
        res.render("error.ejs", {error: "No email supplied"});
    }
    if(!password) {
        res.render("error.ejs", {error: "No password given"});
    }

    let promise = new Promise(function(resolve, reject) {
      users.find().toArray(function(err, result) {
        if(result != undefined) {
          for(let i = 0; i < result.length; i++) {
            if(result[i].userName == userName) {
              reject("User names are the same");
              break;
            }
          }
          resolve("Different user name");
        }
      });
    });

    //Get the number of records with that email.
    //If it's not an error, insert the new user and move to signin page
    promise.then(function(result) {
      users.insert({'userName': userName, 'password': password}, function(err, result) {
        console.log(err + '|' + result);
      });
      res.render("signup.ejs", {});
    }, function(err) {
      console.log(err);
      res.render("error.ejs", {error: "User name already taken."});
    });
});

app.get('/signin', function(req, res){
  let enteredUserName = req.query.userName;
  let enteredPassword = req.query.password;
  let query = {userName: enteredUserName};

  users.find(query).toArray(function(err, result) {
    if(result != undefined && result[0].password == enteredPassword) {
      //pass username using https://nodejs.org/docs/latest/api/url.html#url_class_urlsearchparams
      res.writeHead(307,
        {Location: '/chat' + '?userName=' + enteredUserName}
      );
      res.end();
    } else {
      res.render("invalid.ejs", {});
    }
  });
});

app.get('/deleteAccount', function(req, res){
  let enteredUserName = req.query.userName;
  let enteredPassword = req.query.password;
  let query = {userName: enteredUserName};

  users.find(query).toArray(function(err, result) {
    if(result != undefined && result[0].password == enteredPassword) {
      users.remove({'userName': enteredUserName, 'password': enteredPassword}, function(err, result) {
        console.log('deleted');
      });
      res.render("deleted.ejs", {});
      res.end();
    } else {
      res.render("invalid.ejs", {});
    }
  });
});

app.get('/chat', function(req, res) {
  res.sendFile(__dirname + '/chat/chat.html');
});

app.use(express.static('public'));
app.use(express.static('css'));
app.use(express.static('javascript'));
app.use(express.static('images'));

var waitingForPartner = [];
var chats = [];
var userNames = [];
var myMap = new Map();

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on("userName", function(name) {
    console.log(name);
    var color = randomColor();
    if (!myMap.has(name)) {
        var mapIter = myMap.values();
        for (let i = 0; i < myMap.size; i++) {
          if (mapIter.next().value == color) {
            color = randomColor();
          }
        }
        myMap.set(name, color);
        console.log('emitting user name: ' + name);
        io.emit("Start Chat", Array.from(myMap));
    }
    console.log(myMap);
  });
});

http.listen(80, function() {
  console.log('listening on *:80');
});