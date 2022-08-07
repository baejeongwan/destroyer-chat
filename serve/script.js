'use strict';
let socket = io();
let usernameModal = new bootstrap.Modal(getID('usernameModal'), {backdrop: 'static', keyboard: false});
let settingModal = new bootstrap.Modal(getID('settingModal'), {backdrop: 'static', keyboard: false});
let user;
let isReady = false;
let isAlt;
let settingData;
const editor = Jodit.make('#messageBox')


init();

function init() {
    if (document.cookie != "") {
        //Broken information
        delCookie();
    } else {
        //Not logged in
        usernameModal.show();
    }
    getID('settingModal').addEventListener('show.bs.modal', () => {
        loadSettings();
    })

}

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
        <br>
        <small class="text-muted">${data.writer}</small>
    </div>`
    if (isReady && !(getCookie('userName') == data.writer) && settingData.notif) {
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
    if (localStorage.getItem('setting') == null) {
        let data = {
            notif: true
        };
        localStorage.setItem('setting', JSON.stringify(data));
        settingData = data;
    } else {
        settingData = JSON.parse(localStorage.getItem('setting'));
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


function setNotifPermission() {
    Notification.requestPermission();
}

function saveSetting() {
    let data = {
        notif: getID('notificationEnableSwitch').checked
    };
    localStorage.setItem('setting', JSON.stringify(data));
    settingData = data;
}

function loadSettings() {
    getID('notificationEnableSwitch').checked = settingData.notif;
}