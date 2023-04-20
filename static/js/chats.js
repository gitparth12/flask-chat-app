const username = localStorage.getItem("username");
const userPassword = localStorage.getItem("userPassword");

window.addEventListener("load", function(event) {
    var response = postData({ "operation": "get_friends", "username": username });
    response.then(function(result) {
        for (var key in result) {
            if (key !== "status") {
                make_button(key);
            }
        }
    });
});

var form = document.getElementById("add_friend_form");
form.onsubmit = function(e) {
    e.preventDefault();

    var friend_username = document.getElementById("friend_username").value;
    var response = postData({ "operation": "get_friends", "username": username });
    response.then(function(result) {
        if (!result.hasOwnProperty(friend_username)) {
            var chatKey = CryptoJS.lib.WordArray.random(16).toString();
            var encrypted_chatKey = encryptStringWithKey(userPassword, chatKey);
            var res = postData({
                "operation": "add_friend",
                "username": username,
                "encrypted_key": encrypted_chatKey,
                "friend_username": friend_username,
                "chat_key": chatKey
            });
            res.then(function(result) {
                if (result["status"] === "success") {
                    alert("Friend added successfully!");
                    // make_button(friend_username);
                }
            });
        }
    });
}


function make_button(friend_username) {
    var button = document.createElement('button');
    button.innerHTML = friend_username;
    const chat_buttons = document.getElementById('chat_buttons');
    chat_buttons.appendChild(button);
    button.addEventListener("click", function() {
        const data = { "operation": "get_ChatKey", "username": username, "friend_username": friend_username };
        var response = postData(data);
        // response.then((result) => alert(result));
        response.then(function(result) {
            localStorage.setItem('chatKey', result["chatKey"]);
            localStorage.setItem('friend_username', friend_username);
            return window.location.href = `/chats/${username}/${friend_username}`;
        });
    });
}

function encryptStringWithKey(key, plaintext) {
    const fixedSalt = '$2b$10$AbcDefGhIjKlmnoPqrst.';
    const iv = CryptoJS.lib.WordArray.random(16); // generate a random IV
    const ciphertext = CryptoJS.AES.encrypt(plaintext, key+fixedSalt, {
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
    const fixedSalt = '$2b$10$AbcDefGhIjKlmnoPqrst.';
    const plaintextBytes = CryptoJS.AES.decrypt(ciphertext, key+fixedSalt, {
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
        return response.json();
    }).catch((err) => console.error(err));
    //.then((jsonResponse) => {
    // Log the response data in the console
    // console.log(jsonResponse);
    //})
}
