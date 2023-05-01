import json
import os


class DB:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self) -> None:
        self.users = {}
        # self.users["A"] = [("A", 00000), ("B", 12345), ("D", 67890)]
        # self.users["B"] = [("B", 00000), ("A", 12345)]
        # self.users["C"] = [("C", 00000)]
        # self.users["D"] = [("D", 00000), ("A", 67890)]
        self.current_user = None

    def export_JSON(self):
        """
        Creates jsons for users in in-memory db dictionary
        """
        if not os.path.exists("db"):
            os.makedirs("db")

        for user, data in self.users.items():
            # create a filename for the user's JSON file
            filename = f"db/{user}.json"
            if os.path.exists(filename):
                mode = "w"
            else:
                mode = "x"
            # open the file for writing
            with open(filename, mode) as f:
                # write the data to the file
                json.dump(data, f)

    def create_chats(self):
        """
        Creates chats for hardcoded users
        """
        createdchats = []
        data = {"messages": []}
        json_data = json.dumps(data, indent=2)

        for user, data in self.users.items():
            for entry in data:
                if entry[0] == user or entry[0] in createdchats:
                    continue
                file_path = f"chats/{user}and{entry[0]}.json"
                if os.path.exists(file_path):
                    with open(f"chats/{user}and{entry[0]}.json", "w") as f:
                        f.write(json_data)
                else:
                    with open(f"chats/{user}and{entry[0]}.json", "x") as f:
                        f.write(json_data)
            createdchats.append(user)

    def username_valid(self, username):
        """
        Checks if the username exists in the db
        """
        for filename in os.listdir("db/"):
            if os.path.splitext(filename)[0] == username:
                return True
        return False

    def get_friends(self, username):
        """
        Creates a list of a given users friends
        """
        for filename in os.listdir("db/"):
            if os.path.splitext(filename)[0] == username:
                with open("db/" + filename) as f:
                    data = json.load(f)
                data = {k: v for (k, v) in data if k != username}
                return data
        return {}

    def new_chat(self, username, friend_name):
        """
        Creates a new chat between 2 users
        """
        data = []
        json_data = json.dumps(data, indent=2)
        if self.alphabetical(username, friend_name):
            with open(f"chats/{username}and{friend_name}.json", "w") as f:
                f.write(json_data)
        else:
            with open(f"chats/{friend_name}and{username}.json", "w") as f:
                f.write(json_data)

    def import_JSON(self):
        """
        Updates in-memory database dictionary with .jsons
        """
        for filename in os.listdir("db"):
            user = os.path.splitext(filename)[0]
            with open(f"db/{filename}") as f:
                data = json.load(f)
            self.users[user] = data

    def signup(self, username, chatKey):
        """
        Adds a user to the in-memory db and exports to a json
        """
        self.users[username] = [[username, chatKey]]
        self.export_JSON()

    def get_chatKey(self, username, friend_name):
        """
        Gets a given chatKey for a user and their friend
        """
        for user, data in self.users.items():
            if user == username:
                for entry in data:
                    if entry[0] == user:
                        continue
                    if entry[0] == friend_name:
                        return entry[1]

    def get_ownChatKey(self, username):
        """
        Gets a given chatKey for a user
        """
        for user, data in self.users.items():
            if user == username:
                for entry in data:
                    if entry[0] == username:
                        return entry[1]

    def get_messages(self, username, friend_name):
        """
        Gets the messages and splits the usernames from the messages
        returns a list of tuples such that [[username, message], [username, message]]
        """
        namedMessages = []
        try:
            if self.alphabetical(username, friend_name):
                with open(f"chats/{username}and{friend_name}.json", "r") as f:
                    existing_messages = json.load(f)
                    for msg in existing_messages:
                        namedMessages.append(msg.split(".", 1))
            else:
                with open(f"chats/{friend_name}and{username}.json", "r") as f:
                    existing_messages = json.load(f)
                    for msg in existing_messages:
                        namedMessages.append(msg.split(".", 1))
            return namedMessages
        except FileNotFoundError:
            return []

    def add_msg_to_chat(self, username, friend_name, message):
        """
        Adds a message to a chat between username and friend_name,
        where username is the user who sent the message
        """
        usrMsg = [username + "." + message]
        if self.alphabetical(username, friend_name):
            try:
                with open(f"chats/{username}and{friend_name}.json", "r") as f:
                    existing_messages = json.load(f)
            except FileNotFoundError:
                return False
            existing_messages.extend(usrMsg)
            with open(f"chats/{username}and{friend_name}.json", "w") as f:
                json.dump(existing_messages, f)
        else:
            try:
                with open(f"chats/{friend_name}and{username}.json", "r") as f:
                    existing_messages = json.load(f)
            except FileNotFoundError:
                return False
            existing_messages.extend(usrMsg)
            with open(f"chats/{friend_name}and{username}.json", "w") as f:
                json.dump(existing_messages, f)
        return True

    def alphabetical(self, x, y):
        """
        Returns True if x is first alphabetically, False if y is.
        """
        for i in range(min(len(x), len(y))):
            if x[i] < y[i]:
                # {x} comes before {y} alphabetically
                return True
            elif x[i] > y[i]:
                # {y} comes before {x} alphabetically"
                return False
        else:
            # if the loop completes without breaking, the strings are equal up to the length of the shorter string
            if len(x) < len(y):
                # {x} comes before {y} alphabetically"
                return True
            elif len(x) > len(y):
                # {y} comes before {x} alphabetically"
                return False
            else:
                print("x and y cannot be the same!")
                return False

    def add_friend(self, username, userEncChatKey, friend_name, friendChatKey):
        """
        Mutually adds friends to each other's friend tuples in database
        """
        taggedChatKey = "catchmeifyoucan" + friendChatKey
        if not self.username_valid(friend_name):
            return False
        self.users[username].append([friend_name, userEncChatKey])
        self.users[friend_name].append([username, taggedChatKey])
        self.export_JSON()
        return True

    def find_friends(self, username):
        """
        Finds pending friends
        """
        pendingFriends = []
        for tuple in self.users[username]:
            if tuple[1].startswith("catchmeifyoucan"):
                tuple[1] = tuple[1][len("catchmeifyoucan") :]
                pendingFriends.append(tuple)
        if len(pendingFriends) == 0:
            return []
        else:
            return pendingFriends

    def get_chat_filename(self, username, friend_username):
        """
        Returns the name of the file containing chats between
        username and friend_username, without the extension.
        """
        if self.alphabetical(username, friend_username):
            return f"{username}and{friend_username}"
        else:
            return f"{friend_username}and{username}"

    def update_chatKeys(self, username, tuple_list):
        for tuple in tuple_list:
            for entry in self.users[username]:
                if entry[1] == tuple[1]:
                    entry = tuple
                    self.new_chat(username, tuple[0])
        self.export_JSON()


if __name__ == "__main__":
    db = DB.get_instance()
    db.import_JSON()
    db.export_JSON()
    db.new_chat("admin", "test")
