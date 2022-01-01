"""
Scheduler Functionality

Description:
---------------------
Allows the user to send requests to other users or view their own requests.
username is the logged in user who is conducting the tasks
target_username is the user who we want to send requests too.
"""
import uuid
from firebase_admin import firestore
from Search.Search import search_by_timeslots

"""
cred = credentials.Certificate("../serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()  # this connects to our Firestore database
"""


def send_request(db, username, target_username, type_, school_, gym_, timeslot):
    """
    Sends a request to the target user. This request gets added to the pending section of both users.
    The request can only be sent if both users are valid and have the same timeslot available

    :param db: database object
    :param username: unique string to identify user logged in
    :param target_username: unique string to identify user to send request to
    :param type_: string to identify exercise type
    :param school_: string to identify school name
    :param gym_: string to identify gym name
    :param timeslot: list --> [day: str, start_hour: int, end_hour: int]
    :return None
    """
    profile_collection = db.collection('Profile');
    target_profile = profile_collection.document(target_username)
    issuing_user_profile = profile_collection.document(username)

    # Collection - Search
    search_collection = db.collection('Search');

    # Documents to search
    search_school = search_collection.document('school').get().to_dict().get(school_, None);
    search_gym = search_collection.document('gym').get().to_dict().get(gym_, None);
    search_workout_type = search_collection.document('workout_type').get().to_dict().get(type_, None);

    if target_profile.get().to_dict() is None:
        print(f"Appointment request to {target_username} failed. This is not a valid FlexFinder user")
        return

    if not search_workout_type:
        print(f"{type_} Type is invalid")
        return

    if not search_gym:
        print(f"{gym_} gym is invalid")
        return

    if not search_school:
        print(f"{school_} school is invalid")
        return

    if not search_by_timeslots(db, [target_username], [timeslot]):
        print(f"timeslot:{timeslot} not available for target_user:{target_username}")
        return

    if not search_by_timeslots(db, [username], [timeslot]):
        print(f"timeslot:{timeslot} not available for issuing_user:{username}")
        return

    # Update pending section of target user
    appointment_id = uuid.uuid4().hex
    target_profile.update(
        {
            f'schedule.pending.{appointment_id}':
                {
                    "partner": username,
                    "type": type_,
                    "gym": gym_,
                    "timeslot": timeslot
                }
        }
    )

    # Update pending section of issuing user user
    issuing_user_profile.update(
        {
            f'schedule.pending.{appointment_id}':
                {
                    "partner": target_username,
                    "type": type_,
                    "gym": gym_,
                    "timeslot": timeslot
                }
        }
    )

    print(
        f"Successfully scheduled {type_} activity between issuer:{username} and target:{target_username} for timeslot:{timeslot}")


def get_requests(db, username, status: str):
    """

    :param db: database object
    :param username: unique string to identify user
    :param status: 'active' or 'pending' request status
    :return: dict containing request info
    """

    profile_collection = db.collection('Profile');
    user_timeslots = profile_collection.document(username).get().to_dict()['schedule']

    if status == 'active':
        return user_timeslots['active']

    elif status == 'pending':
        return user_timeslots['pending']

    else:
        return None


def respond_requests(db, username: str, appointment_id: str, response: str):
    """

    :param db: database object
    :param username: unique string for logged-in user deciding on response
    :param appointment_id: appointment to view
    :param response: string for "accept" or "decline" status
    :return: None
    """

    profile_collection = db.collection('Profile');
    user_pending_appointments_data = profile_collection.document(username).get().to_dict()['schedule']['pending']

    # check if appointment id exists
    if appointment_id not in user_pending_appointments_data:
        print(f"appointment_id invalid, not found in username:{username}")
        return None

    gym_ = user_pending_appointments_data[appointment_id]["gym"]
    type_ = user_pending_appointments_data[appointment_id]["type"]
    timeslot = user_pending_appointments_data[appointment_id]["timeslot"]
    sender_username = user_pending_appointments_data[appointment_id]["partner"]

    if response not in {"accept", "decline"}:
        print(f"invalid response:{response}")
        return None

    if response == "accept":
        # Update active section for sender and recieving user
        profile_collection.document(sender_username).update({
            f'schedule.active.{appointment_id}': {
                "partner": username,
                "type": type_,
                "gym": gym_,
                "timeslot": timeslot
            }
        })

        profile_collection.document(username).update({
            f'schedule.active.{appointment_id}': {
                "partner": sender_username,
                "type": type_,
                "gym": gym_,
                "timeslot": timeslot
            }
        }
        )

        # Remove from pending section for both users
        profile_collection.document(sender_username).update(
            {f'schedule.pending.{appointment_id}': firestore.DELETE_FIELD})
        profile_collection.document(username).update({f'schedule.pending.{appointment_id}': firestore.DELETE_FIELD})

        # Remove timeslot from timeslots_available for both users
        scheduled_day = timeslot[0];
        scheduled_start_hour = timeslot[1];
        scheduled_end_hour = timeslot[2]
        recieving_user_timeslots = profile_collection.document(username).get().to_dict()["timeslots_available"]
        sender_user_timeslots = profile_collection.document(sender_username).get().to_dict()["timeslots_available"]

        for id, user_timeslot in recieving_user_timeslots.items():
            print(user_timeslot, scheduled_day)
            if user_timeslot['day'] == scheduled_day and user_timeslot['start_time'] == scheduled_start_hour and \
                    user_timeslot['end_time'] == scheduled_end_hour:
                break
        recieving_user_timeslots.pop(id)
        profile_collection.document(username).update({"timeslots_available": recieving_user_timeslots})

        for id, user_timeslot in sender_user_timeslots.items():
            if user_timeslot['day'] == scheduled_day and user_timeslot['start_time'] == scheduled_start_hour and \
                    user_timeslot['end_time'] == scheduled_end_hour:
                break
        sender_user_timeslots.pop(id)
        profile_collection.document(sender_username).update({"timeslots_available": sender_user_timeslots})

        print(
            f"Successfully confirmed appointment:{appointment_id} of {type_} activity between issuer:{username} and target:{sender_username} for timeslot:{timeslot}")

    elif response == "decline":
        # Remove from pending section for both users
        profile_collection.document(sender_username).update(
            {f'schedule.pending.{appointment_id}': firestore.DELETE_FIELD})
        profile_collection.document(username).update({f'schedule.pending.{appointment_id}': firestore.DELETE_FIELD})
        print(
            f"Declined appointment:{appointment_id} of {type_} activity between issuer:{username} and target:{sender_username} for timeslot:{timeslot}")

    else:
        print(f"invalid command or response:{response}")
        return None


def delete_appointment(db, username: str, appointment_id: str):
    """

    :param db: database object
    :param username: unique string for logged-in user deciding on response
    :param appointment_id: appointment to view
    :param response: string for "accept" or "decline" status
    :return: None
    """

    profile_collection = db.collection('Profile');
    user_active_appointments_data = profile_collection.document(username).get().to_dict()['schedule']['active']

    # check if appointment id exists
    if appointment_id not in user_active_appointments_data:
        print(f"appointment_id invalid, not found in username:{username}")
        return None

    sender_username = user_active_appointments_data[appointment_id]["partner"]

    # Remove from active section for both users
    profile_collection.document(sender_username).update({f'schedule.active.{appointment_id}': firestore.DELETE_FIELD})
    profile_collection.document(username).update({f'schedule.active.{appointment_id}': firestore.DELETE_FIELD})

    print(f"Successfully removed appointment:{appointment_id}")

def view_requests(db, username, status: str):
    """
    :uses get_requests() function
    :param db: database object
    :param username: unique string to identify user
    :param status: 'active' or 'pending' request status
    :return: None, prints the data to the console
    """
    if not username or not db.collection('Profile').document(username).get().to_dict():
        print(f"{username} invalid or does not exist")
        return None

    data = get_requests(db, username, status)

    if not data:
        print(f"invalid status: {status}")
        return

    if data == "None":
        print(f"Empty schedule for status:{status}")
        return

    for appointment_id, data in data.items():
        print(f"appointment:{appointment_id}")
        print(data)
        print()

# EXECUTE:
# view_requests(db, "shaz", status='pending')
# send_request(db, 'anando304', 'shaz', "cardio", "uwaterloo", 'gym1', ["mon",1,2])

# send_request(db,"anando304", "graeme", "cardio", "mcmaster", "dbac", ("mon",1,2))
# respond_requests(db, username="graeme", appointment_id="1c707e510b794c14aded18ae1b598cd8", response="decline")
# respond_requests(db, username="graeme", appointment_id="6609ac9566994e33a96ea9fbc9ba5b1b", response="accept")
