// var fs = require('fs');

var form = document.getElementById("message_input_form");
form.onsubmit = function(e) {
    e.preventDefault();

    let username = document.getElementById("username");
    let password = document.getElementById("password");
    alert(username.value);

    const cars = [
        { "make": "Porsche", "model": "911S" },
        { "make": "Mercedes-Benz", "model": "220SE" },
        { "make": "Jaguar", "model": "Mark VII" },
    ];

    if (username.value.length && password.value.length) {
        var chatKey = CryptoJS.lib.WordArray.random(16).toString();
        var encrypted_chatKey = CryptoJS.AES.encrypt(chatKey, password.value).toString();
        const user_info = { "operation": "signup", "username": username.value, "chatKey": encrypted_chatKey };
        var response = postData(user_info);
        /*
        response.then(function(result) {
            if (result['status'] === 'success') {
                return window.location.href = "/login";
            }
            else {
                alert('User already exists, please choose a different username');
            }
        });
        */
    }
};

/*
    var response = getData();
    response.then((result) => console.log(result['greeting']));
    response = response.then(function(result) {
        result['greeting'] = 'Hello from js';
        return result;
    });
    response.then((result) => console.log(result['greeting']));
*/

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
// console.log("js works");
