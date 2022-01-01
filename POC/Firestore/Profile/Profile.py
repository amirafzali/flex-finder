import time, re
from firebase_admin import firestore


class Profile:

    def __init__(self, db):
        self.db = db
        self.username = None
        self.gender = None
        self.gyms = None
        self.school = None
        self.workout_types = None
        self.timeslots_available = None
        self.schedule = None

    def validate_inputs(self, username, gender, gyms, school, workout_types, timeslots):
        search_collection = self.db.collection('Search');
        profile_collection = self.db.collection('Profile');
        user_data = profile_collection.document(username).get().to_dict()

        if not username or user_data:
            print(f"{username} invalid or already exists")
            return False

        if not gender or gender.lower() not in {"m", "f", "other"}:
            print(f"{gender} invalid")
            return False

        if not workout_types or type(workout_types) != set:
            print(f"{workout_types} is invalid datastructure or empty")
            return False

        if workout_types and type(workout_types) == set:
            for workout_type in workout_types:
                if not search_collection.document('workout_type').get().to_dict()[workout_type]:
                    print(f"{workout_types} is does not exist")
                    return False

        if not search_collection.document('school').get().to_dict()[school]:
            print(f"{school} school is invalid")
            return False

        if not gyms or type(gyms) != set:
            print(f"{gyms} is invalid")
            return False

        if gyms:
            for gym in gyms:
                if not search_collection.document('gym').get().to_dict()[gym]:
                    print(f"{gym} does not exist")
                    return False

        # validate timeslots
        validate_days = set(['mon', 'tues', 'wed', 'thurs', 'fri', 'sat', 'sun'])
        for timeslot in timeslots:
            if timeslot[0] not in validate_days:
                print(f"{timeslot[0]} is not a valid day of the week")
                return False

            if not (timeslot[1] >= 0 and timeslot[1] <= 24 and timeslot[2] >= 0 and timeslot[2] <= 24 and timeslot[2] >
                    timeslot[1]):
                print(f"{timeslot[1], timeslot[2]} are invalid hour times")
                return False

        return True

    def create_a_user(self, username, gender, gyms, school, workout_types, timeslots_available, uid):
        if not self.validate_inputs(username, gender, gyms, school, workout_types, timeslots_available):
            print("Failed to create user")
            return

        self.username = username
        self.gender = gender
        self.gyms = gyms
        self.school = school
        self.workout_types = workout_types

        timeslots_of_dicts = {}
        i = 1
        for timeslot in timeslots_available:
            timeslots_of_dicts[str(i)] = {
                "day": timeslot[0],
                "start_time": timeslot[1],
                "end_time": timeslot[2]
            }
            i += 1

        self.timeslots_available = timeslots_of_dicts
        print(self.timeslots_available)
        self.schedule = {"active": None, "pending": None}

        data = {
            "Gender": gender,
            "Gyms": list(gyms),
            "School": school,
            "Workout_types": list(workout_types),
            "timeslots_available": self.timeslots_available,
            "schedule": self.schedule
        }

        print(data)
        search_collection = self.db.collection('Search');
        profile_collection = self.db.collection('Profile');
        uid_collection = self.db.collection("uid");

        # push changes to database profile
        profile_collection.document(username).set(data)
        time.sleep(1)

        # push changes to database search area
        for gym in gyms:
            # insert into Search --> gym
            search_collection.document('gym').update({
                gym: firestore.ArrayUnion([username])
            })

            # insert into Search --> school
            search_collection.document('school').update({
                school: firestore.ArrayUnion([username])
            })

        for workout_type in workout_types:
            # insert into Search --> workout_type
            search_collection.document('workout_type').update({
                workout_type: firestore.ArrayUnion([username])
            })

        # link uid with username in uid collection
        uid_collection.document(uid).set({"username": username})

        print(f"user:{username} successfully created!")

    def existing_user(self, uid):
        username = self.db.collection('uid').document(uid).get().to_dict()['username']

        data = self.db.collection('Profile').document(username).get().to_dict()
        self.username = username
        self.gender = data["Gender"]
        self.gyms = data["Gyms"]
        self.school = data["School"]
        self.workout_types = data["Workout_types"]
        self.timeslots_available = data["timeslots_available"]
        self.schedule = data["schedule"]

        print(f"Username: {username}, successfully loaded!")


'''
cred = credentials.Certificate("../serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()  # this connects to our Firestore database
'''

'''
user = input("enter username:")
username = user
gender = input("Enter gender: (M/F/Other)")

gyms = re.sub(r'\s+', '', input("Enter valid Gym names: string seperated commas (eg; 'Gym1, Gym2, ...'"))
gyms = set(gyms.split(','))

school = input("Enter school name:")

workout_types = re.sub(r'\s+', '',input("Enter valid workout type: string seperated commas (eg; 'cardio, core, ...'"))
workout_types = set(workout_types.split(','))

timeslots_available = eval(input("Enter timeslots(24 hours) as a nested list(day, start_hour, end_hour): eg: [['mon',9, 7]]"))
profile = Profile(db)
profile.create_a_user(username,gender,gyms,school,workout_types,timeslots_available)
'''

"""
user = "ross"
username = user
gender = "m"

gyms = set(['gym1'])

school = "uoft"

workout_types = set(["cardio"])

timeslots_available = [['mon',9,12]]
profile = Profile(db)
profile.create_a_user(username,gender,gyms,school,workout_types,timeslots_available)
"""
