console.log("Loading few stuff....")
const fs = require('fs');
const readline = require('readline');
let file = JSON.parse(fs.readFileSync('./users.json'));
const std = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let email;
let password;
let nickname;
let token;

console.log("Wait a while, did you closed server [y/n]?");

std.once('line', function (line) {
    console.log(line)
    if (line == "y") {
        continueOnNewUser()
    } else {
        console.log("New user must be created when server is closed. Please close server")
        process.exit();
    }
})

function continueOnNewUser() {
    console.log("What will new user's email be?")
    std.once('line', function (line) {
        email = line;
        askPassword();
    })
}

function askPassword() {
    console.log("Password:");
    std.once('line', function (line) {
        password = line;
        askNN();
    })
}

function askNN() {
    console.log("Nickname: ");
    std.once('line', function (line) {
        nickname = line;
        finalize();
    })
}

function finalize() {
    console.log("Creating random token...");
    let randomStr = Math.random().toString(36).substring(2, 12);
    token = randomStr;
    console.log("Preparing to write to file...");
    file.push({
        email: email,
        password: password,
        nickname: nickname,
        token: token
    })
    console.log("Writing...");
    fs.writeFileSync('./users.json', JSON.stringify(file));
    console.log("Alright!");
    process.exit();
}