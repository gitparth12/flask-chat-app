const username = localStorage.getItem("username");
const userPassword = localStorage.getItem("userPassword");

var form = document.getElementById("login_form");
form.onsubmit = function(e) {
    e.preventDefault();

    let friend_username = document.getElementById("friend_username").value;
    var response = postData({"username": username, "friend_username": friend_username});
}

//var userPassword = localStorage.getItem('userPassword');
alert(userPassword);

var friends_promise = postData({ "operation": "get_messages" });
friends_promise.then(function(friends) {

});

function make_button(friend_username) {
    var button = document.createElement('button');
    button.innerHTML = friend_username;
    const area = document.getElementById('chat_buttons');
    area.appendChild(button);
    button.addEventListener("click", function() {
        const data = { "operation": "get_ownChatKey", "friend_username": friend_username };
        var response = postData(data);
        response.then((result) => alert(result));

        localStorage.setItem('chatKey', password);
        return window.location.href = "/chats";
    });
}

function encryptStringWithKey(key, plaintext) {
    const iv = CryptoJS.lib.WordArray.random(16); // generate a random IV
    const ciphertext = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv
    }).toString();
    const mac = CryptoJS.HmacSHA256(ciphertext, key).toString();
    return `${iv.toString(CryptoJS.enc.Hex)}.${ciphertext}.${mac}`;
}

function decryptStringWithKey(key, message) {
    const [ivHex, ciphertext, mac] = message.split('.');
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const computedMac = CryptoJS.HmacSHA256(ciphertext, key).toString();
    if (computedMac !== mac) {
        throw new Error('Password authentication failed');
    }
    const plaintextBytes = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv
    });
    return plaintextBytes.toString(CryptoJS.enc.Utf8);
}


function getData() {
    return fetch("/get")
        .then(function(response) {
            return response.json();
        })
    /*
        .then(function(text) {
            console.log("GET response:");
            // var result = text[dictKey];
            // return result;
            console.log("text: " + text);
        });
    */
}

function postData(data) {
    return fetch("/post", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(data),
    }).then((response) => {
        if (response.redirected) {
            alert("Signed up successfully!");
            // return res.json();
            window.location.replace(response.url);
        } else {
            alert("something is wrong");
        }
    }).catch((err) => console.error(err));
    //.then((jsonResponse) => {
    // Log the response data in the console
    // console.log(jsonResponse);
    //})
}
