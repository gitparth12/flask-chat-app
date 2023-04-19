var form = document.getElementById("message_input_form");
form.onsubmit = function(e) {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    alert(username);

    if (username.length && password.length) {
        // set the variable in localStorage
        //localStorage.setItem('userPassword', password);

        const user_info = { "operation": "login", "username": username };
        var response = postData(user_info);

        response.then(function(result) {
            console.log(result);
            if (result['status'] === 'success') {
                var chatKey = result['chatKey'];
                console.log(chatKey);
                if (decryptStringWithKey(password, chatKey)) {
                    localStorage.setItem('username', username);
                    localStorage.setItem('userPassword', password);
                    return window.location.href = "/chats";
                }
                else {
                    alert("Couldn't log in, please check details and try again.");
                }
            }
        });
    }
};


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
