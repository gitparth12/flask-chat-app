# This file provides a very simple "no sql database using python dictionaries"
# If you don't know SQL then you might consider something like this for this course
# We're not using a class here as we're roughly expecting this to be a singleton

# If you need to multithread this, a cheap and easy way is to stick it on its own bottle server on a different port
# Write a few dispatch methods and add routes

# A heads up, this code is for demonstration purposes; you might want to modify it for your own needs
# Currently it does basic insertions and lookups

import json
import os
from datetime import datetime

from Crypto.Cipher import AES
from Crypto.Hash import HMAC, SHA256


class Table:
    def __init__(self, table_name, *table_fields):
        self.entries = []
        self.fields = table_fields
        self.name = table_name

    def create_entry(self, data):
        """
        Inserts an entry in the table
        Doesn't do any type checking
        """

        # Bare minimum, we'll check the number of fields
        if len(data) != len(self.fields):
            raise ValueError("Wrong number of fields for table")

        self.entries.append(data)
        return

    def search_table(self, target_field_name, target_value):
        """
        Search the table given a field name and a target value
        Returns the first entry found that matches
        """
        # Lazy search for matching entries
        for entry in self.entries:
            for field_name, value in zip(self.fields, entry):
                if target_field_name == field_name and target_value == value:
                    return entry

        # Nothing Found
        return None

    def to_json(self):
        return json.dumps(self.entries)


class DB:
    """
    This is a singleton class that handles all the tables
    You'll probably want to extend this with features like multiple lookups, and deletion
    A method to write to and load from file might also be useful for your purposes
    """

    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.tables = {}

        # Setup your tables
        # self.add_table("A", "friend", "chatKey")
        # self.add_table("B", "friend", "chatKey")
        # self.add_table("C", "friends", "chatKey")
        # self.add_table("D", "friends", "chatKey")
        return

    def add_table(self, table_name, *table_fields):
        """
        Creates a user db by adding a table to the database
        """
        table = Table(table_name, *table_fields)
        AandBkey = 12345
        AandDkey = 67890
        if table_name == "A":
            table.create_entry(["B", AandBkey])
            table.create_entry(["D", AandDkey])
        elif table_name == "B":
            table.create_entry(["A", AandBkey])
        elif table_name == "D":
            table.create_entry(["A", AandDkey])
        self.tables[table_name] = table

        return

    def search_table(self, table_name, target_field_name, target_value):
        """
        Calls the search table method on an appropriate table
        """
        return self.tables[table_name].search_table(target_field_name, target_value)

    def create_table_entry(self, table_name, data):
        """
        Calls the create entry method on the appropriate table
        """
        return self.tables[table_name].create_entry(data)

    def export_JSON(self):
        """
        Creates .json files for each user
        """
        for name, table in self.tables.items():
            file_path = f"db/{name}.json"
            if os.path.exists(file_path):
                with open(f"db/{name}.json", "w") as f:
                    f.write(table.to_json())
            else:
                with open(f"db/{name}.json", "x") as f:
                    f.write(table.to_json())

        # if not os.path.exists('db/admin.json'):
        #    with open(f'db/admin.json', 'x') as f:
        #        f.write('[]')

    def create_chats(self):
        """
        Creates empty chats for hardcoded users
        """
        createdchats = []
        data = {"messages": []}
        json_data = json.dumps(data, indent=2)

        for name, table in self.tables.items():
            for entry in table.entries:
                if entry[0] in createdchats:
                    continue
                file_path = f"chats/{name}and{entry[0]}.json"
                if os.path.exists(file_path):
                    with open(f"chats/{name}and{entry[0]}.json", "w") as f:
                        f.write(json_data)
                else:
                    with open(f"chats/{name}and{entry[0]}.json", "x") as f:
                        f.write(json_data)
            createdchats.append(name)

    def message_add_test(self, filepath):
        """
        A test for the formatting of the message jsons
        """
        # Read the existing JSON file
        with open(filepath) as file:
            existing_data = json.load(file)

        # Create a new message object with a user
        new_message = {
            "id": len(existing_data["messages"]) + 1,  # Assign a unique ID
            "text": "Hit me with another test",
            "timestamp": int(datetime.timestamp(datetime.now())),
            "user": "A",
        }

        # Add the new message to the existing JSON data
        existing_data["messages"].append(new_message)

        # Write the updated JSON back to the file

        with open(filepath, "w") as file:
            json.dump(existing_data, file, indent=2)

    def username_valid(self, username):
        """
        Checks if the username exists in the db
        """
        for filename in os.listdir("db/"):
            if os.path.splitext(filename)[0] == username:
                return True
        return False

    def get_friend_list(self, username):
        """
        Creates a list of a given users friends
        """
        for filename in os.listdir("db/"):
            if os.path.splitext(filename)[0] == username:
                with open("db/" + filename) as f:
                    data = json.load(f)
                friends = [item[0] for item in data]
                print(friends)
                return friends
        return False

    def new_chat(self, username, friend_name):
        """
        Creates a new chat between 2 users
        """
        data = {"messages": []}
        json_data = json.dumps(data, indent=2)
        with open(f"chats/{username}and{friend_name}.json", "w") as f:
            f.write(json_data)

    def update_tables(self):
        """
        Updates the in-memory db for when the client edits the .jsons
        """
        for filename in os.listdir("db/"):
            username = os.path.splitext(filename)[0]
            with open("db/" + filename) as f:
                data = json.load(f)
                for item in data:
                    friend_name, chatKey = item
                self.add_table(username, "friends", "chatKey")
                self.create_table_entry(username, [friend_name, chatKey])

    def import_JSON(self):
        """
        Reads .json files for each user and loads the data into the corresponding tables
        """
        for filename in os.listdir("db/"):
            name, ext = os.path.splitext(filename)
            if ext == ".json":
                with open(f"db/{filename}", "r") as f:
                    data = json.load(f)
                    table_fields = None
                    for table_name, table in self.tables.items():
                        if table_name == name:
                            table_fields = table.fields
                            break
                    if table_fields is not None:
                        table = Table(name, *table_fields)
                        table.entries = data
                        self.tables[name] = table

    def signup(self, username, chatKey):
        self.add_table(username, "friend", "chatKey")
        self.create_table_entry(username, [username, chatKey])
        self.export_JSON()


# Our global database
# Invoke this as needed
database = DB()
