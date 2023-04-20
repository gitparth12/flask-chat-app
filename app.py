import json
import sys
from datetime import datetime

import requests
from bson.json_util import dumps
from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_login import (LoginManager, current_user, login_required,
                         login_user, logout_user)
from flask_socketio import SocketIO, join_room, leave_room
from pymongo.errors import DuplicateKeyError

from dictDB import DB

app = Flask(__name__)
app.secret_key = "sfdjkafnk"
socketio = SocketIO(app)
login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/post", methods=["POST"])
def post_fn():
    data = request.get_json()
    if data is None:
        return jsonify({"status": "failure"})
    data = jsonify(data).json
    print(f"data: {data}")
    operation = data["operation"]
    # print(type(data.json))
    if operation == "signup":
        db.signup(data["username"], data["chatKey"])
        return redirect(url_for("login"))
    elif operation == "login":
        if db.username_valid(data["username"]):
            db.current_user = data["username"]
            chatKey = db.get_ownChatKey(db.current_user)
            pending_friends = db.find_friends(data["username"])
            # print(pending_friends)
            message = {
                "status": "success",
                "username": db.current_user,
                "chatKey": chatKey,
                "pending_friends": pending_friends,
            }
            return jsonify(message)
        return jsonify({"status": "failure"})
    elif operation == "get_messages":
        messages = db.get_messages(data["username"], data["friend_username"])
        return jsonify(messages)
    elif operation == "send_message":
        if db.add_msg_to_chat(
            data["username"], data["friend_username"], data["message"]
        ):
            return jsonify({"status": "success"})
        else:
            return jsonify({"status": "failure"})
    elif operation == "update_pending":
        db.update_chatKeys(data["username"], data["pending_friends"])
        return jsonify({"status": "success"})
    elif operation == "get_friends":
        friends = db.get_friends(data["username"])
        if friends:
            friends["status"] = "success"
            return jsonify(friends)
        else:
            message = {
                "status": "failure",
            }
            return jsonify(message)
    elif operation == "add_friend":
        if db.add_friend(
            data["username"],
            data["encrypted_key"],
            data["friend_username"],
            data["chat_key"],
        ):
            return jsonify({"status": "success"})
        return jsonify({"status": "failure"})
    elif operation == "get_ChatKey":
        chatKey = db.get_chatKey(data["username"], data["friend_username"])
        filename = db.get_chat_filename(data["username"], data["friend_username"])
        return jsonify({"status": "success", "chatKey": chatKey, "filename": filename})


@app.route("/get", methods=["GET"])
def get_fn():
    message = {"greeting": "Hello from flask!"}
    return jsonify(message)


@app.route("/chats")
def chats():
    # friends = ["test1", "test2", "test3", "test4", "test5"]
    friends = db.get_friends(db.current_user)
    # if current_user.is_authenticated:
    #     rooms = get_rooms_for_user(current_user.username)
    return render_template("chats.html")


if __name__ == "__main__":
    db = DB.get_instance()
    db.import_JSON()
    db.export_JSON()

    app.run(ssl_context=("cert.pem", "key.pem"), debug=True, port=sys.argv[1])
