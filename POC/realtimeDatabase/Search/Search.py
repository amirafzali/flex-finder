import re
"""
Search Functionality

Description:
---------------------
Search for users based on:
    - username
    - school, exercise type, gym
    
Users must also provide the timeslots they want to find a valid match for.
"""
def search_by_username(db, username, timeslots):
    if not username or username not in db.child("Profile").child("username").get().val():
        print(f"{username} invalid or does not exist")
        return None

    return valid_timeslots_match(db, [username], timeslots)

def search_by_school_type_gym(db, school_, type_, gym_, timeslots):
    if type_ not in db.child("Search").child("Type").get().val():
        print(f"{type_} Type is invalid")
        return

    if school_ not in db.child("Search").child("School").get().val():
        print(f"{school_} school is invalid")
        return

    if gym_ not in db.child("Search").child("School").child(school_).child("Gyms").get().val():
        print(f"{gym_} NOT FOUND in {school_} school")
        return

    persons_matching_type = re.sub(r'\s+', '', db.child("Search").child("Type").child(type_).get().val())
    persons_matching_type = set(persons_matching_type.split(","))

    persons_matching_gym = re.sub(r'\s+', '', db.child("Search").child("School").child(school_).child("Gyms").child(gym_).get().val())
    persons_matching_gym = set(persons_matching_gym.split(","))

    valid_person_matches =  persons_matching_gym & persons_matching_type
    return valid_timeslots_match(db, valid_person_matches, timeslots)

    #print(f"Valid matches of {school_}, {gym_}, and exercise_type:{type_} is {valid_person_matches}")

def valid_timeslots_match(db, lst_of_users, available_timeslots):
    """
    :param available_timeslots: set of time slots provided by the user for valid match
    :return: list of usernames with valid timeslot match
    """

    for user in lst_of_users:
        if user not in db.child("Profile").child("username").get().val():
            print(f"{user} does not exist")
            return None

        user_timeslots = eval(db.child("Profile").child("username").child(user).child("timeslots_available").get().val())
        for user_timeslot in user_timeslots:
            if user_timeslot in available_timeslots:
                print(f"timeslots match for {user}: {user_timeslot}")
                return user_timeslot

    print("No match found")
    return None
