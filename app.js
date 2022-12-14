const express = require('express');
const socket = require('socket.io');
const http = require('http');
const fs = require('fs');
const push = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const vhost = require('vhost');
const app = express();
const website = express();
//const server = https.createServer({key: fs.readFileSync('./certs/private.key'), ca: fs.readFileSync('./certs/root.ca.crt'), cert: fs.readFileSync('./certs/private.crt'), passphrase: "jaydenbae"}, app);
const server = http.createServer(app, website);
const io = socket(server);

const publicVAPIDKey = "BE0w5cacTk7qYkoMbldLwO9VZXYGJutmdrFTTNDvcgLiDGB1pZoRaWZuWz2t122ixQR9rQI6IW8BOHveCyyw9fs";
const privateVAPIDKey = "wohgXHjkyrcu7pulpZiM0Mb7GPb81_jP6DXoNR7Hgtw";
push.setVapidDetails('mailto:jayden.bae@outlook.kr', publicVAPIDKey, privateVAPIDKey)

app.use(express.static(path.join(__dirname, "serve")));
website.use(express.static((path.join(__dirname, "thedestroyers"))))
website.use(vhost("thedestroyers.com", app));
website.use(vhost("www.thedestroyers.com", app));
app.use(vhost("chat.thedestroyers.com", website));

app.use(bodyParser.json());
let pushSubscription = [];

setInterval(() => {
    const payload = JSON.stringify({ title: "Push Hi"});
    if (pushSubscription != null) {
        pushSubscription.forEach((value) => {
            push.sendNotification(value, payload).catch((err) => {
                console.log("error")
            })
        })
    }
    
}, 2000);

app.post("/push", (req, res) => {
    const subscription = req.body;
    console.log(req.body)
    pushSubscription.push(subscription)
    res.status(201).json({});
})

let record;
let user;

//Record init
if (fs.existsSync('./chats.json')) {
    //Loadthem
    record = JSON.parse(fs.readFileSync('./chats.json', {encoding: 'utf-8'}));
} else {
    fs.writeFileSync('./chats.json', '[]');
    record = [];
}

if (fs.existsSync('./users.json')) {
    //Loadthem
    user = JSON.parse(fs.readFileSync('./users.json', {encoding: 'utf-8'}));
} else {
    fs.writeFileSync('./users.json', '[]');
    user = [];
}

io.sockets.on('connection', function(socket) {
    console.log("Hi");
    let userID;
    socket.on('newUserHello', function (data) {
        let success = false;
        user.forEach((element, index, array) => {
            if (element.email == data.email) {
                //Verify password
                if (element.password == data.password) {
                    let success = true;
                    //Alright!
                    let data = {
                        token: element.token,
                        username: element.nickname
                    }
                    socket.emit('authOK', data)
                    socket.broadcast.emit('newUser', {newUserName: element.nickname});
                    let dataPush = {
                        type: 'newUser',
                        data: {newUserName: element.nickname}
                    };
                    record.push(dataPush);
                    saveData();
                    userID = element.nickname;
                }
            }
        });
        
        if (!success) {
            socket.emit('authErr', {error: "autherr"});
        }
    });
    
    socket.on('message', function (data) {
        console.log("Messages: ", data);
        let success = false;
        user.forEach((value, index, array) => {
            if (data.writer == value.token) {
                success = true;
                io.sockets.emit("message", {writer: value.nickname, message: data.message});
                let dataPush = {
                    type: 'message',
                    data: {writer: value.nickname, message: data.message}
                };
                record.push(dataPush);
                saveData();
            }
        })
        if (!success) {
            socket.emit('incorrectAuth', {error: "error"});
        }
    })

    socket.on('disconnect', function () {
        io.sockets.emit('leave', {user: userID});
        let dataPush = {
            type: 'leave',
            data: {user: userID}
        };
        record.push(dataPush);
        saveData();
    })

    socket.on("requestChatData", function (data) {
        record.forEach((element, index) => {
            socket.emit(element.type, element.data);
        });
        socket.emit('loaddone', 'loaddone');
    })
})

server.listen(process.env.PORT || 80, function () {
    console.log("Server listening..@", process.env.PORT || 80);
})

function saveData() {
    fs.writeFileSync('./chats.json', JSON.stringify(record));
}