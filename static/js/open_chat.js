const username = localStorage.getItem("username");
const friend_username = localStorage.getItem("friend_username");
const userPassword = localStorage.getItem("userPassword");
const chatKey = localStorage.getItem("chatKey");


var response;
window.addEventListener("load", function(event) {
    response = postData({ "operation": "get_messages", "username": username, "friend_username": friend_username });
    // response.then((result) => console.log(result[0]));
    response.then(function(messages) {
        messages.forEach(function(message) {
            let decrypted = decryptStringWithKey(chatKey, message[1]);
            add_message(message[0], decrypted);
        });
    });
});



function add_message(sender, message) {
    var newNode = document.createElement('div');
    newNode.innerHTML = `<b>${sender}&nbsp;:&nbsp;</b> ${message}`;
    const messages_div = document.getElementById('messages');
    messages_div.insertBefore(newNode, messages_div.firstChild);
}


var form = document.getElementById("message_input_form");

form.onsubmit = function(e) {
    e.preventDefault();

    let message = document.getElementById("message_input").value;

    if (message.length) {
        let encrypted_message = encryptStringWithKey(chatKey, message);
        var sendMessage = postData({
            "operation": "send_message",
            "message": encrypted_message,
            "username": username,
            "friend_username": friend_username
        });
        sendMessage.then(function(result) {
            if (result["status"] === "success") {
                location.reload();
            }
            else {
                alert("There was a problem sending the message");
            }
        });
    }
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



/*
socket.on('connect', function() {
    socket.emit('join_room', {
        username: "{{ username }}",
        room: "{{ room._id }}"
    });

    let message_input = document.getElementById('message_input');

    document.getElementById('message_input_form').onsubmit = function(e) {
        e.preventDefault();
        let message = message_input.value.trim();
        if (message.length) {
            socket.emit('send_message', {
                username: "{{ username }}",
                room: "{{ room._id }}",
                message: message
            })
        }
        message_input.value = '';
        message_input.focus();
    }
});

let page = 0;

document.getElementById("load_older_messages_btn").onclick = (e) => {
    page += 1;
    fetch("/rooms/{{ room._id }}/messages?page=" + page, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        response.json().then(messages => {
            messages.reverse().forEach(message => prepend_message(message.text, message.sender, message.created_at));
        })
    })
};

function prepend_message(message, username, created_at) {
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${username}&nbsp;[${created_at}]:&nbsp;</b> ${message}`;
    const messages_div = document.getElementById('messages');
    messages_div.insertBefore(newNode, messages_div.firstChild);
}

window.onbeforeunload = function() {
    socket.emit('leave_room', {
        username: "{{ username }}",
        room: "{{ room._id }}"
    })
};

socket.on('receive_message', function(data) {
    console.log(data);
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}&nbsp;[${data.created_at}]:&nbsp;</b> ${data.message}`;
    document.getElementById('messages').appendChild(newNode);
});

socket.on('join_room_announcement', function(data) {
    console.log(data);
    if (data.username !== "{{ username }}") {
        const newNode = document.createElement('div');
        newNode.innerHTML = `<b>${data.username}</b> has joined the room`;
        document.getElementById('messages').appendChild(newNode);
    }
});

socket.on('leave_room_announcement', function(data) {
    console.log(data);
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}</b> has left the room`;
    document.getElementById('messages').appendChild(newNode);
});

*/
