import sys

from Firebase.firebase_api import firebase_class
from Profile.Profile import Profile
from Scheduler.Scheduler import *
from Search.Search import *
import re
"""
This is very scrappy code.
We may want to isolate to only a few univeristies or McMaster only
We may need to adjust the timeslots for dates in addition to the hours that are available.
For simplicity, used whole number hours. We may also want to create a way for checking if valid times and if overlaps
occur.

We need to add logic for accepting things and declining any other open schedules so cannot overwrite!

In addition, we must update the profile class so that when a new user is created, it updates the university and gym
for Search area too!
"""

def help():
    print("""Enter commands:\n
                  search_by_username,\n
                  search_by_school_type_gym,\n
                  view_requests,\n
                  send_requests,\n
                  respond_requests""")




if __name__ == '__main__':
    ''' Create connection to DB '''
    firebase = firebase_class()
    # Get database instance
    db = firebase.get_db()

    #data = {(1,2), ("11/06/2021",1,2)}
    #print(data)

    #"""
    # Prompt user to use existing username or create/register new username
    command = input("type 'r' to register new user. type 'l' to use login using existing username")
    profile = Profile(db)
    running = True
    
    
    # Load Profile data
    if command and type(command) == str:
        user = input("enter username:")
        if command == 'r':
            username = user
            gender = input("Enter gender: (M/F/Other)")

            gyms = re.sub(r'\s+', '', input("Enter valid Gym names: string seperated commas (eg; 'Gym1, Gym2, ...'"))
            gyms = set(gyms.split(','))

            school = input("Enter school name:")

            workout_types = re.sub(r'\s+', '',input("Enter valid workout type: string seperated commas (eg; 'cardio, core, ...'"))
            workout_types = set(workout_types.split(','))

            timeslots_available = eval(input("Enter timeslots(24 hours) as a set of tuples(start,end): eg: {(1,2),(5,6), (13,15)}"))
            profile.create_a_user(username,gender,gyms,school,workout_types,timeslots_available)
        if command == 'l':
            profile.existing_user(user)

    else:
        print("INVALID COMMAND")
        running = False

    if running:
        print(f"\nWelcome {user}!")
        help()

        while running:
            print()
            input_ = input("Enter command:\n")
            input_lst = input_.split()
            command = input_lst[0].lower().strip()

            if len(input_lst) == 1:
                if command == "exit":
                    print("Thanks for using FlexFinder!")
                    sys.exit()
                elif command == "help":
                    help()

                elif command == "search_by_username":
                    username = input("enter username").strip()
                    timeslots_available = input("Enter timeslots as a list of tuples: eg; [(1,2),(12,14)]").strip()

                    search_by_username(db, username, eval(timeslots_available))

                elif command == "search_by_school_type_gym":
                    school =  input("enter school").strip()
                    workout_type =  input("enter workout type: (eg; cardio, core)").strip()
                    gym = input("enter gym: (eg; DBAC, Gym1, etc)").strip()
                    timeslots_available = eval(input("Enter timeslots as a list of tuples: eg; [(1,2),(12,14)]").strip())

                    search_by_school_type_gym(db, school, workout_type, gym, timeslots_available)

                elif command == "view_requests":
                    username =  input("username").strip()
                    status =  input("enter request status(ie; active or pending)").strip()

                    view_requests(db, username, status)

                elif command == "send_requests":
                    sender_username = input("Enter your username").strip()
                    recipient_username = input("Enter recipient username").strip()
                    workout_type = input("enter workout type: (eg; cardio, core)").strip()
                    school = input("Enter school name:").strip()
                    gym = input("enter gym: (eg; DBAC, Gym1, etc)").strip()
                    timeslots_available = eval(input("Enter timeslot as a tuples(start, end): (1,2)").strip())

                    send_request(db, sender_username, recipient_username, workout_type, school, gym, timeslots_available)

                elif command == "respond_requests":
                    recipient_username = input("Enter recipient username").strip()
                    appointment_id = input("Enter appointment id: eg: -MnqfPhsUyTssIEMcwGg").strip()
                    response = input("Enter response: (eg; accept or decline").strip()

                    respond_requests(db, username=recipient_username, appointment_id=appointment_id, response=response)

                else:
                    print(f"Invalid command:{command}")

            else:
                print(f"Invalid command:{command}")

    #"""





    """TESTING SEARCH AND MATCH CAPABILITY"""
    #search_by_school_type_gym(db, "McMaster", "cardio", "DBAC", [(1,2),(12,14)]) # FInd Good match, return anando: (1,2)
    #search_by_school_type_gym(db, "McMaster", "cardio", "DBAC", [(9, 10), (12, 14)])  # FInd Good match, return graeme: (9, 10)
    #search_by_school_type_gym(db, "McMaster", "cardio", "DBAC",
    #                          [(13, 14), (14, 19)])  # FInd NO match
    #search_by_school_type_gym(db, "UWaterloo", "cardio", "DBAC", [(1,2),(12,14)]) # Expects gym to be invalid
    #search_by_school_type_gym(db, "UWaterloo", "cardio", "Gym1", [(1,2),(12,14)]) # Shaz
    #search_by_school_type_gym(db, "UWaterloo", "core", "Gym1", [(1,2),(12,14)])   # Expect Amir

    #search_by_username(db, "anando304", [(1, 2), (12, 14)]) # Find match



    """TESTING SCHEDULER CAPABILITY"""
    #view_requests(db, "anando304", "active")
    #view_requests(db, "anando304", "pending")

    #send_request(db,"anando304", "graeme", "cardio", "McMaster", "DBAC", (1,2))
    #respond_requests(db, username="graeme", appointment_id="-MnqbLJP7tNaYnCOI7sh", response="decline")
    #respond_requests(db, username="graeme", appointment_id="-MnqfPhsUyTssIEMcwGg", response="accept")
