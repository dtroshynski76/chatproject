/* eslint-disable no-var, linebreak-style, max-len, require-jsdoc */
var socket = io();
var colorMap = new Map();
$(function() {
    var socket = io();
    $('form').submit(function() {
        var urlString = window.location.href;
        var url = new URL(urlString);
        var userName = url.searchParams.get('userName');
        socket.emit('chat message', {
            'message': $('#m').val(),
            'userName': userName,
        });
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msg) {
        var ul = document.getElementById('messages');
        var li = document.createElement('li');
        var nameMarker = document.createTextNode(msg.userName + ': ');
        li.appendChild(nameMarker);
        li.appendChild(document.createTextNode(msg.message));
        if (!colorMap.get(msg.userName)) {
            colorMap.set(msg.userName, '#FF00FF');
        }
        li.setAttribute('style', 'background: ' + colorMap.get(msg.userName));
        ul.appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
        // $('#messages').append($('<li>').text(msg.message));
    });
});
window.onload = function() {
    var socket = io();
    var urlString = window.location.href;
    var url = new URL(urlString);
    var userName = url.searchParams.get('userName');
    if (document.cookie.indexOf('signedIn') == -1) {
        document.cookie = 'signedIn=' + userName + ';';
    }
    var cookies = document.cookie;
    console.log('cookies: ' + cookies);
    var cookieUserName = cookies.substring('signedIn='.length, cookies.length);
    console.log('signedIn cookies: ' + cookieUserName);
    socket.emit('userName', userName);
};
socket.on('Start Chat', function(msg) {
    console.log('colorMap in Start Chat: ');
    var map = new Map(msg);
    colorMap = map;
    console.log(colorMap);
});
