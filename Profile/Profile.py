import time
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

    def validate_inputs(self, username, gender, gyms, school, workout_types):
        if not username or username in self.db.child("Profile").child("username").get().val():
            print(f"{username} invalid or already exists")
            return False

        if not gender or gender not in {"M", "F", "Other"}:
            print(f"{gender} invalid")
            return False

        if not workout_types or type(workout_types) != set:
            print(f"{workout_types} is invalid datastructure or empty")
            return False

        if workout_types and type(workout_types) == set:
            for workout_type in workout_types:
                if workout_type not in self.db.child("Search").child("Type").get().val():
                    print(f"{workout_types} is does not exist")
                    return False

        if school not in self.db.child("Search").child("School").get().val():
            print(f"{school} school is invalid")
            return False

        if not gyms or type(gyms) != set:
            print(f"{gyms} is invalid")
            return False

        if gyms:
            for gym in gyms:
                if gym not in self.db.child("Search").child("School").child(school).child("Gyms").get().val():
                    print(f"{gym} does not exist")
                    return False

        return True

    def create_a_user(self, username,gender,gyms,school,workout_types, timeslots_available):
        if not self.validate_inputs(username, gender, gyms, school, workout_types):
            print("Failed to create user")
            return

        self.username = username
        self.gender = gender
        self.gyms = gyms
        self.school = school
        self.workout_types = workout_types
        self.timeslots_available = timeslots_available
        self.schedule = {"active": None, "pending": None}

        data = {
            "Gender": gender,
            "Gyms": ", ".join(list(gyms)),
            "School": school,
            "Workout_types": str(workout_types),
            "timeslots_available": str(timeslots_available)
        }

        # push changes to database profile
        self.db.child("Profile").child("username").update(
            {username: data})
        time.sleep(1)
        self.db.child("Profile").child("username").child(username).child("schedule").update(
            {"active": "None"})
        self.db.child("Profile").child("username").child(username).child("schedule").update(
            {"pending": "None"})

        # push changes to database search area
        for gym in gyms:
            data = self.db.child("Search").child("School").child(school).child("Gyms").child(gym).get().val()
            data = "" if not data else data
            # push/update username for the given university gym
            self.db.child("Search").child("School").child(school).child("Gyms").update({gym:data + ", " + username})

        for workout_type in workout_types:
            data = self.db.child("Search").child("Type").child(workout_type).get().val()
            data = "" if not data else data
            # push/update username for the exercise type
            self.db.child("Search").child("Type").update({workout_type: data + ", " + username})

        print(f"user:{username} successfully created!")

    def existing_user(self,username):
        if not username or username not in self.db.child("Profile").child("username").get().val():
            print(f"Unable to load existing user information. {username} does not exist")
            return

        data = self.db.child("Profile").child("username").child(username).get().val()
        self.username = username
        self.gender = data["Gender"]
        self.gyms = data["Gyms"]
        self.school = data["School"]
        self.workout_types = data["Workout_types"]
        self.timeslots_available = data["timeslots_available"]
        self.schedule = data["schedule"]

        print(f"Username: {username}, successfully loaded!")