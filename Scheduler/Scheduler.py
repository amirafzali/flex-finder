"""
Scheduler Functionality

Description:
---------------------
Allows the user to send requests to other users or view their own requests.
username is the logged in user who is conducting the tasks
target_username is the user who we want to send requests too.
"""


def send_request(db, username, target_username, type_, school_, gym_, timeslot):
    """
    Sends a request to the target user. This request gets added to the pending section of both users.
    The request can only be sent if it is valid and is in the available timeslots of both users.

    accept/decline request function does the action and moves from pending to active of each user.
    That function also updates the timeslots_available for each user to reflect new changes since a timeslot is now gone!

    :param db: database object
    :param username: unique string to identify user logged in
    :param target_username: unique string to identify user to send request to
    :param type_: string to identify exercise type
    :param school_: string to identify school name
    :param gym_: string to identify gym name
    :param timeslot: set of tuples representing start and end times
    :return None
    """
    if target_username not in db.child("Profile").child("username").get().val():
        print(f"Appointment request to {target_username} failed. This is not a valid FlexFinder user")
        return

    if type_ not in db.child("Search").child("Type").get().val():
        print(f"{type_} Type is invalid")
        return

    if gym_ not in db.child("Search").child("School").child(school_).child("Gyms").get().val():
        print(f"{gym_} NOT FOUND in {school_} school")
        return

    target_username_timeslots_available = eval(
        db.child("Profile").child("username").child(target_username).child("timeslots_available").get().val())
    issuing_user_timeslots_available = eval(
        db.child("Profile").child("username").child(username).child("timeslots_available").get().val())

    if timeslot not in target_username_timeslots_available:
        print(f"timeslot:{timeslot} not available for target_user:{target_username}")
        return

    if timeslot not in issuing_user_timeslots_available:
        print(f"timeslot:{timeslot} not available for issuing_user:{username}")
        return

    # Update pending section of each issuing and target user.
    push_data = db.child("Profile").child("username").child(target_username).child("schedule").child("pending").push({
        "username": username,
        "type": type_,
        "gym": gym_,
        "timeslot": str(timeslot)
    })

    # extract appointment_id after pushing
    appointment_id = push_data['name']

    db.child("Profile").child("username").child(username).child("schedule").child("pending").child(appointment_id).update({
        "username": target_username,
        "type": type_,
        "gym": gym_,
        "timeslot": str(timeslot)
    })

    print(
        f"Successfully scheduled {type_} activity between issuer:{username} and target:{target_username} for timeslot:{timeslot}")


def get_requests(db, username, status: str):
    """

    :param db: database object
    :param username: unique string to identify user
    :param status: 'active' or 'pending' request status
    :return: dict containing request info
    """

    if status == 'active':
        return db.child("Profile").child("username").child(username).child("schedule").child('active').get().val()

    elif status == 'pending':
        return db.child("Profile").child("username").child(username).child("schedule").child('pending').get().val()

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

    user_pending_appointments_data = db.child("Profile").child("username").child(username).child("schedule").child('pending').get().val()
    # check if appointment id exists
    if appointment_id not in user_pending_appointments_data:
        print(f"appointment_id invalid, not found in username:{username}")
        return None

    gym_ = user_pending_appointments_data[appointment_id]["gym"]
    type_ = user_pending_appointments_data[appointment_id]["type"]
    timeslot = user_pending_appointments_data[appointment_id]["timeslot"]
    sender_username = user_pending_appointments_data[appointment_id]["username"]

    if response not in {"accept", "decline"}:
        print(f"invalid response:{response}")
        return None

    if response == "accept":
        # Update active section for sender and recieving user
        db.child("Profile").child("username").child(sender_username).child("schedule").child("active").child(appointment_id).update({
            "username": username,
            "type": type_,
            "gym": gym_,
            "timeslot": timeslot
        })


        db.child("Profile").child("username").child(username).child("schedule").child("active").child(appointment_id).update({
            "username": sender_username,
            "type": type_,
            "gym": gym_,
            "timeslot": timeslot
        })

        # Remove from pending section for both users
        db.child("Profile").child("username").child(sender_username).child("schedule").child("pending").child(appointment_id).remove()
        db.child("Profile").child("username").child(username).child("schedule").child("pending").child(appointment_id).remove()

        # Remove timeslot from timeslots_available for both users
        recieving_user_timeslots = eval(db.child("Profile").child("username").child(username).child("timeslots_available").get().val())
        sender_user_timeslots = eval(db.child("Profile").child("username").child(sender_username).child("timeslots_available").get().val())

        recieving_user_timeslots.remove(eval(timeslot))
        sender_user_timeslots.remove(eval(timeslot))

        # stringify set to push to firebase timeslots available
        recieving_user_timeslots = str(recieving_user_timeslots)
        sender_user_timeslots = str(sender_user_timeslots)


        db.child("Profile").child("username").child(username).update({"timeslots_available":recieving_user_timeslots})
        db.child("Profile").child("username").child(sender_username).update({"timeslots_available":sender_user_timeslots})

        print(
            f"Successfully confirmed appointment:{appointment_id} of {type_} activity between issuer:{username} and target:{sender_username} for timeslot:{timeslot}")

    elif response == "decline":
        # Remove from pending section for both users
        db.child("Profile").child("username").child(sender_username).child("schedule").child("pending").child(appointment_id).remove()
        db.child("Profile").child("username").child(username).child("schedule").child("pending").child(appointment_id).remove()
        print(
            f"Declined appointment:{appointment_id} of {type_} activity between issuer:{username} and target:{sender_username} for timeslot:{timeslot}")

    else:
        print(f"invalid command or response:{response}")
        return None



def view_requests(db, username, status: str):
    """
    :uses get_requests() function
    :param db: database object
    :param username: unique string to identify user
    :param status: 'active' or 'pending' request status
    :return: None, prints the data to the console
    """
    if not username or username not in db.child("Profile").child("username").get().val():
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