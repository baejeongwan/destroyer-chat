'use strict';
let socket = io();
let usernameModal = new bootstrap.Modal(getID('usernameModal'), {backdrop: 'static', keyboard: false});
let settingModal = new bootstrap.Modal(getID('settingModal'), {backdrop: 'static', keyboard: false});
let user;
let isReady = false;
let isAlt;

usernameModal.show();

socket.on('connect', function() {
    getID('chatBox').innerHTML += `
    <div class="alert alert-success chatAlert" role="alert">
        서버에 접속하였습니다!
    </div>
    `
    getID('chatBox').scrollTop = getID('chatBox').scrollHeight;
})

socket.on('newUser', (data) => {
    getID('chatBox').innerHTML += `
    <div class="alert alert-success chatAlert" role="alert">
        ${data.newUserName} 님이 로그인 했습니다.
    </div>`
    getID('chatBox').scrollTop = getID('chatBox').scrollHeight;
})

socket.on('message', (data) => {
    getID('chatBox').innerHTML += `
    <div class="alert alert-primary chatAlert" role="alert">
        ${data.message}
        <hr>
        ${data.writer}
    </div>`
    if (isReady && !(getCookie('userName') == data.writer)) {
        new Notification(data.writer, {body: data.message});
    }
    getID('chatBox').scrollTop = getID('chatBox').scrollHeight;
})

socket.on('loaddone', function () {
    console.log("Load!");
    isReady = true;
})

socket.on('leave', (data) => {
    getID('chatBox').innerHTML += `
    <div class="alert alert-danger chatAlert" role="alert">
        ${data.user} 님이 로그아웃 했습니다.
    </div>`
    getID('chatBox').scrollTop = getID('chatBox').scrollHeight;
})

socket.on('authOK', (data) => {
    let newUsernameEncode = encodeURIComponent(data.username);
    document.cookie = "userName=" + newUsernameEncode;
    let userTokenEncode = encodeURIComponent(data.token);
    document.cookie = "userToken=" + userTokenEncode;
    usernameModal.hide();
    if (!(Notification.permission == 'granted')) {
        Notification.requestPermission();
    }
})

socket.on('authErr', (data) => {
    //Show error message
    getID('loginerr-info').classList.remove('d-none');
})

socket.on('incorrectAuth', (data) => {
    delCookie();
})

function send() {
    socket.emit('message', {message: getID('messageBox').value, writer: getCookie('userToken')});
    getID('messageBox').value = "";
}

function hello() {
    socket.emit('newUserHello', {email: getID('username').value, password: getID('password').value})
    //Wait for respond
}



window.onkeydown = function (e) {
    if (e.which == 18) {
        isAlt = true;
    }

    if (isAlt && e.which == 83) {
        console.log("ALT + S")
        send()
    }
    
    if (isAlt && e.which == 81) {
        console.log("ALT + Q")
        var cookies = document.cookie.split(";");
        delCookie();
    }
} 

window.onkeyup = function (e) {
    if (e.which == 18) {
        isAlt = false;
    }
}

function getID(id) {
    return document.getElementById(id)
}

function getCookie(cname) {
    var name = cname + "=";  
    var decodedCookie = decodeURIComponent(document.cookie);  
    var ca = decodedCookie.split(';');  
    for(var i = 0; i <ca.length; i++) {  
        var c = ca[i];  
        while (c.charAt(0) == ' ') {  
            c = c.substring(1);  
        }
  
        if (c.indexOf(name) == 0) {  
            return c.substring(name.length, c.length);  
        }
    }
  
    return "";  
} 
  
function delCookie() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    location.reload()

}

function setNotifPermission() {
    Notification.requestPermission();
}