var form = document.getElementById("message_input_form");
form.onsubmit = function(e) {
    e.preventDefault();

    let username = document.getElementById("username");
    let password = document.getElementById("password");
    alert(username.value);

    if (username.value.length && password.value.length) {
        // set the variable in localStorage
        localStorage.setItem('userPassword', password.value);

        const user_info = { "operation": "login", "username": username.value };
        var response = postData(user_info);

        response.then(function(result) {
            if (result['status'] === 'success') {
                return window.location.href = "/chats";
            }
            else {
                alert("Couldn't log in, please check details and try again.");
            }
        });
    }
};




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
