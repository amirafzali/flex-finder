##  @file firebase_creds.py
#  @author Anando Zaman
#  @brief Used for initializing a database instance/connector with firebase_admin API
#  @date December 24, 2021
import firebase_admin
from firebase_admin import credentials, firestore
import pyrebase

class firebase_class:
    def __init__(self):
        self.cred = credentials.Certificate("./serviceAccountKey.json")
        firebase_admin.initialize_app(self.cred)
        self.db = firestore.client()
        self.uid = None

    def sign_in(self, email, password):
        config = {
            "apiKey": "AIzaSyAMRrIrwHaLz5L3pSr3FkSsjinOlZasG5o",
            "authDomain": "flexfinder-53ed1.firebaseapp.com",
            "databaseURL": "https://flexfinder-53ed1-default-rtdb.firebaseio.com",
            "projectId": "flexfinder-53ed1",
            "storageBucket": "flexfinder-53ed1.appspot.com",
            "messagingSenderId": "435603823849",
            "appId": "1:435603823849:web:54b404b516525491c8a478"
        }
        firebase = pyrebase.initialize_app(config)
        auth = firebase.auth()
        res = auth.sign_in_with_email_and_password(email, password)
        self.uid = auth.get_account_info(res['idToken'])["users"][0]['localId']

    def sign_up(self, email, password):
        config = {
            "apiKey": "AIzaSyAMRrIrwHaLz5L3pSr3FkSsjinOlZasG5o",
            "authDomain": "flexfinder-53ed1.firebaseapp.com",
            "databaseURL": "https://flexfinder-53ed1-default-rtdb.firebaseio.com",
            "projectId": "flexfinder-53ed1",
            "storageBucket": "flexfinder-53ed1.appspot.com",
            "messagingSenderId": "435603823849",
            "appId": "1:435603823849:web:54b404b516525491c8a478"
        }
        firebase = pyrebase.initialize_app(config)
        auth = firebase.auth()
        res = auth.create_user_with_email_and_password(email, password)
        self.uid = auth.get_account_info(res['idToken'])["users"][0]['localId']