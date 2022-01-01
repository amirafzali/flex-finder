import re

"""
Search Functionality

Description:
---------------------
Search for users based on:
    - username
    - school, exercise type, gym
    - timeslot
"""
import firebase_admin
from firebase_admin import credentials, firestore

#cred = credentials.Certificate("../serviceAccountKey.json")
#firebase_admin.initialize_app(cred)
#db = firestore.client()  # this connects to our Firestore database


def search(db, username: str = "", gym: str = "", school: str = "", workout_type: str = "", timeslots: list = None) -> set():

    # username ONLY search
    users = set([])  # contains all matched/found users

    if username:
        profile = db.collection('Profile').document(username).get().to_dict()

        if profile is None:
            print(f"{username} invalid or does not exist")
            return None
        else:
            users.add(username)

    # Collection - Search
    search_collection = db.collection('Search');

    # Documents to search
    search_school = search_collection.document('school').get().to_dict().get(school, None);
    search_gym = search_collection.document('gym').get().to_dict().get(gym, None);
    search_workout_type = search_collection.document('workout_type').get().to_dict().get(workout_type, None);

    if search_gym and search_school and search_workout_type:
        users.union(set(search_gym) & set(search_school) & set(search_workout_type))

    elif search_gym and search_school:
        users.union(set(search_gym) & set(search_school))

    elif search_gym and search_workout_type:
        users.union(set(search_gym) & set(search_workout_type))

    elif search_school and search_workout_type:
        users.union(set(search_school) & set(search_workout_type))

    elif search_gym:
        users.union(set(search_gym))

    elif search_school:
        users.union(set(search_school))

    elif search_workout_type:
        users.union(set(search_workout_type))

    # if timeslot provided, check if any user in users list is a match
    # timeslot: [day: str, time_start: int, time_end: int]
    if timeslots and users:
        users = search_by_timeslots(db, users, timeslots)

    return users


# usage:
# provide list of users: ['anando304', 'graeme',...]
# provide 2D list of timeslots to match: [['mon',1,2], ['tues',3,4]]
def search_by_timeslots(db, users: list, timeslots: list):
    valid_users = []
    for timeslot in timeslots:
        day = timeslot[0]
        start_hour = timeslot[1]
        end_hour = timeslot[2]

        for user in users:
            available_user_timeslots = db.collection('Profile').document(user).get().to_dict()['timeslots_available']
            for _, user_timeslot in available_user_timeslots.items():
                if user_timeslot['day'] == day and user_timeslot['start_time'] == start_hour and user_timeslot['end_time'] == end_hour:
                    valid_users.append(user)
                    break

    return set(valid_users)


# EXECUTE
#print(search(db, username="graeme", gym="", school="", workout_type="", timeslots=[['mon',1,2]]))
#print(search(db, username="", gym="", school="mcmaster", workout_type="cardio", timeslot=None))
