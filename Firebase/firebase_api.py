##  @file firebase_creds.py
#  @author Anando Zaman
#  @brief Used for initializing a database instance/connector with Firebase API credentials
#  @date October 19, 2021
import pyrebase

## @brief This class is used for initiailzing the Firebase API connection and contains methods for interaction.
# @details Contains API setup and the various getter/setter methods to make changes to the DB during first-start.
class firebase_class:

    ## @brief Constructor
    # @details Contains all the information that is needed to interface with the database
    def __init__(self):
        # firebase stuff
        self.config = {
          "apiKey": "AIzaSyAMRrIrwHaLz5L3pSr3FkSsjinOlZasG5o",
          "authDomain": "flexfinder-53ed1.firebaseapp.com",
          "databaseURL": "https://flexfinder-53ed1-default-rtdb.firebaseio.com",
          "projectId": "flexfinder-53ed1",
          "storageBucket": "flexfinder-53ed1.appspot.com",
         "messagingSenderId": "435603823849",
          "appId": "1:435603823849:web:54b404b516525491c8a478"
        }

        self.firebase = pyrebase.initialize_app(self.config)
        self.auth = self.firebase.auth()
        # firebase instance of user
        self.user = None
        # string containing username
        self.username = None
        self.db = self.firebase.database()

    ## @brief Getter method to retrieve DB instance
    #  @details Gets reference to database
    #  @return Returns a firebase DB object
    def get_db(self):
        return self.db

    ## @brief Setter method sign-in a user and update the user-field.
    #  @param email: string value representing email address
    #  @param password: string value representing password
    # @details Authenticates the user and creates a session.
    def sign_in(self,email,password):
        self.user = self.auth.sign_in_with_email_and_password(email, password)

    ## @brief Setter method that creates an account for the user
    #  @param email: string value representing email address
    #  @param password: string value representing password
    # @details Authenticates the user and creates a session.
    def sign_up(self,email,password):
        self.user = self.auth.create_user_with_email_and_password(email, password)

    ## @brief Getter method used for user instance.
    #  @details  Useful for signing out and identifying the user-ID(UID) of a given user.
    #  @return Returns String representing the UID of the current logged-in user. Otherwise, returns None
    def get_user_instance(self):
        return self.user

    ## @brief Getter method that retrieves the username
    #  @return Returns the username, if user field is populated ONCE user is authenticated. Otherwise, returns None
    def get_username(self):
        return self.username

    ## @brief Setter method that updates the local username
    #  @param username: string value representing username
    #  @details Updates the local_username during authentication, to use with the rest of the app
    def set_username(self,username):
        self.username = username

    ## @brief Getter method to retreive UID
    # @details Gets the Unique userID if the user is authenticated.
    # @return Returns the UID string
    def get_UID(self):
        if self.user:
            return self.auth.get_account_info(self.user['idToken'])["users"][0]['localId']
        return None
