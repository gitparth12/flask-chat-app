var form = document.getElementById("login_form");

form.onsubmit = function(e) {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username.length && password.length) {
        // set the variable in localStorage
        //localStorage.setItem('userPassword', password);

        const user_info = { "operation": "login", "username": username };
        var response = postData({ "operation": "login", "username": username });

        response.then(function(result) {
            console.log(result);
            if (result['status'] === 'success') {
                var chatKey = result['chatKey'];
                console.log(chatKey);
                if (decryptStringWithKey(password, chatKey) !== "invalid") {
                    result["pending_friends"].forEach(function(friend_tuple) {
                        friend_tuple[1] = encryptStringWithKey(password, friend_tuple[1]).toString();
                    });
                    let sendEncryptedPending = postData({
                        "operation": "update_pending",
                        "username": username,
                        "pending_friends": result["pending_friends"]
                    });
                    sendEncryptedPending.then(function(result) {
                        if (result["status"] === "success") {
                            console.log(result["pending_friends"]);
                            localStorage.setItem('username', username);
                            localStorage.setItem('userPassword', password);
                            return window.location.href = "/chats";
                        }
                        else {
                            alert("Couldn't add pending friends");
                        }
                    });
                }
                else {
                    alert("Invalid password.");
                }
            }
            else {
                alert("User does not exist.");
            }
        });
    }
};


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
        alert("Incorrect password");
        throw new Error("Incorrect password");
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
        if (response.ok) {
            return response.json();
        } else {
            alert("something is wrong");
        }
    })
        //.then((jsonResponse) => {
        // Log the response data in the console
        //console.log(jsonResponse);
        //})
        .catch((err) => console.error(err));
}
