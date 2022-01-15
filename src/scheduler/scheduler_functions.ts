/**
 * File: scheduler_functions.ts
 * Date: January 1st, 2021
 * Details: LOGIC FUNCTIONS: handles scheduling related changes with Firebase. Ex; send/respond requests, get_requests, decline_appointment
*/

import { collection, Firestore, getDoc, doc, getDocs, updateDoc, deleteField, setDoc } from "firebase/firestore"; 

import { db } from "../firebase/firebase";
import {search_by_timeslot} from "../search/Search"
import {v4 as uuidv4} from "uuid"

interface timeslot_object {
    day: string,
    start_time: string,
    end_time: string,
}

export async function send_request(sender_username:string, recipient_username:string, workout_type:string, school:string, gym:string, timeslot:timeslot_object){
    /**
     * Send request from sender to recipient with certain requirements(ie; school, gym, etc)
     * Returns: None
     * If succussful, creates a new appointment branch under each users Profile schedule.pending section on FireStore
    */

    // Collections
    const profileCollection = collection(db,"Profile");
    const searchCollection = collection(db,"Search");

    // Profile Documents
    const sender_profile = doc(profileCollection,sender_username);
    let sender_profileSnap = await getDoc(sender_profile);

    const recipient_profile = doc(profileCollection,recipient_username);
    let recipient_profileSnap = await getDoc(recipient_profile);

    // PRE-CONDITION CHECKS
    // ------------------------------------------
    // Valid recipient
    const recipient_profileSnap_object = recipient_profileSnap.data()
    if (!(recipient_profileSnap_object) || (typeof recipient_profileSnap_object === undefined)){
        console.log(recipient_username + " is invalid target username. Please use a valid username");
        return [false, recipient_username + " is invalid target username. Please use a valid username"];
    }

    // valid workout type
    const search_workout_type_object = await(getDoc(doc(searchCollection,"workout_type"))).then((response)=>response.data());
    if (search_workout_type_object){
        if(search_workout_type_object.hasOwnProperty(workout_type) === false){
            console.log(workout_type + " workout_type is invalid");
            return [false, workout_type + " workout_type is invalid"];
        }
    }

    // valid gym
    const search_gym_object = await(getDoc(doc(searchCollection,"gym"))).then((response)=>response.data());
    if (search_gym_object){
        if(search_gym_object.hasOwnProperty(gym) === false){
            console.log(gym + " gym is invalid");
            return [false, gym + " gym is invalid"];
        }
    }

    // valid school
    const search_school_object = await(getDoc(doc(searchCollection,"school"))).then((response)=>response.data());
    if (search_school_object){
        if(search_school_object.hasOwnProperty(school) === false){
            console.log(school + " school is invalid");
            return [false, school + " school is invalid"];
        }
    }

    // isValid timeslot for recipient and sender
    console.log(sender_username);
    const recipient_timeslot_match_size = await search_by_timeslot(new Set([recipient_username]), timeslot=timeslot).then((response) => {return response.size});
    const sender_timeslot_match_size = await search_by_timeslot(new Set([sender_username]), timeslot=timeslot).then((response) => {return response.size});

    if ((recipient_timeslot_match_size) < 1){
        console.log(recipient_username + " doesn't have the matching timeslot");
        return [false, recipient_username + " doesn't have the matching timeslot"];
    }

    // UPDATE pending sections of both users
    const appointment_id = uuidv4();
    let key = "schedule.pending."+ appointment_id;
    console.log(key);
    console.log(timeslot);
    let res1 = await updateDoc(recipient_profile, { // recipient
        [key]: {
            "partner": sender_username,
            "type": workout_type,
            "gym": gym,
            "timeslot": {
                day: timeslot.day,
                start_time: Number(timeslot.start_time),
                end_time: Number(timeslot.end_time)
            },
            "is_sender": false
        }
    })

    let res2 = await updateDoc(sender_profile, { // sender
        [key]: {
            "partner": recipient_username,
            "type": workout_type,
            "gym": gym,
            "timeslot": {
                day: timeslot.day,
                start_time: Number(timeslot.start_time),
                end_time: Number(timeslot.end_time)
            },
            "is_sender": true
        }
    }).then(() => console.log("successfully scheduled appointment:" + appointment_id + " between " + recipient_username + " & " + sender_username ));

    return [true, "success"];
}

export async function get_requests(username: string, status: string){
    /**
     * Lookup the appointments(pending/active) associated with a given user
     * status : ['active','pending']
     * Returns a MAP with all matching requests {appointment_id: data_results}
     */

    // Collections
    const profileCollection = collection(db,"Profile");

    // firebase object containing data
    const user_profile_object = await(getDoc(doc(profileCollection,username))).then((response)=>response.data());
    
    // Return schedule.active or schedule.pending results, else NULL
    if (user_profile_object){
        if (user_profile_object.hasOwnProperty("schedule")){
            if(status === "active"){
                console.log("RESULTS: ",user_profile_object['schedule']['active']);
                return user_profile_object['schedule']['active'];
            }

            else if (status === "pending"){
                console.log("RESULTS: ",user_profile_object['schedule']['pending']);
                return user_profile_object['schedule']['pending'];
            }

            else{
                console.log("RESULTS: ",null);
                return null
            }
        }

        console.log("RESULTS: ",null);
        return null
    }
    
    return null;
}


export async function respond_requests(username: string, appointment_id: string, response: string){
    /**
     * Accept or decline a request for the given recipient user
     * Returns None
     * 
     * */

     // Collections
     const profileCollection = collection(db,"Profile");
 
     // Profile results
     let profileSnap = await(getDoc(doc(profileCollection,username))).then((response)=>response.data());
     let profileSnap_data = null;
     if (profileSnap){
        profileSnap_data = profileSnap['schedule']['pending'];
     }

     if(!profileSnap_data.hasOwnProperty(appointment_id)){
         console.log("appointment_id invalid, not found in username:" + username);
         return
     }

     const gym = profileSnap_data[appointment_id]['gym'];
     const workout_type = profileSnap_data[appointment_id]['type'];
     const timeslot = profileSnap_data[appointment_id]['timeslot'];
     const sender_username = profileSnap_data[appointment_id]['partner'];

     if (!((response === "accept") || (response === "decline"))){
        console.log("invalid response" + response);
        return
     }

     const sender_username_doc = doc(profileCollection,sender_username);
     const recipient_username_doc = doc(profileCollection, username);

     if (response === "accept"){
         
         // Update active section for sender and recipient users
         let key = 'schedule.active.' + appointment_id;
         await updateDoc(sender_username_doc, {
            [key]: {
                "partner": username,
                "type": workout_type,
                "gym": gym,
                "timeslot": timeslot
            }
         })

         await updateDoc(recipient_username_doc, {
            [key]: {
                "partner": sender_username,
                "type": workout_type,
                "gym": gym,
                "timeslot": timeslot
            }
         })

        // Remove from pending section for both users
        key = 'schedule.pending.' + appointment_id;
        await updateDoc(sender_username_doc, {
            [key]: deleteField()
         })

        await updateDoc(recipient_username_doc, {
            [key]: deleteField()
         })

        // Remove timeslot available for both users
        const scheduled_day = timeslot['day'];
        const scheduled_start_hour = timeslot['start_time'];
        const scheduled_end_hour = timeslot['end_time'];

        const recipientuserSnap = await(getDoc(doc(profileCollection,username))).then((response)=>response.data());
        const senderuserSnap = await(getDoc(doc(profileCollection,sender_username))).then((response)=>response.data());

        let recipientuserSnap_data:{ [key: string]: any };
        let senderuserSnap_data:{ [key: string]: any };
        if (recipientuserSnap){
            recipientuserSnap_data = recipientuserSnap["timeslots_available"];

            let id = '0';
            for (const [id_, user_timeslot] of Object.entries(recipientuserSnap_data)){
                if ((user_timeslot['day'] === scheduled_day) && (user_timeslot['start_time'] === scheduled_start_hour) && (user_timeslot['end_time'] === scheduled_end_hour)){
                    id = id_;
                    delete recipientuserSnap_data[id];
                    console.log(id, recipientuserSnap_data);
                    await updateDoc(recipient_username_doc, {
                        "timeslots_available": recipientuserSnap_data
                    }).then(() => console.log(username + " successfully confirmed appointment:" + appointment_id));
                    break;
                }
            }
        }

        if (senderuserSnap){
            senderuserSnap_data = senderuserSnap["timeslots_available"];

            let id = '0';
            for (const [id_, user_timeslot] of Object.entries(senderuserSnap_data)){
                if ((user_timeslot['day'] === scheduled_day) && (user_timeslot['start_time'] === scheduled_start_hour) && (user_timeslot['end_time'] === scheduled_end_hour)){
                    id = id_;
                    delete senderuserSnap_data[id];
                    console.log(id, senderuserSnap_data);
                    await updateDoc(sender_username_doc, {
                        "timeslots_available": senderuserSnap_data
                    }).then(() => console.log(sender_username + " successfully confirmed appointment:" + appointment_id));
                    break;
                }
            }
        }   
    }

    else if (response === "decline"){
        let key = 'schedule.pending.' + appointment_id;
        await updateDoc(sender_username_doc, {
            [key]: deleteField()
         });

        await updateDoc(recipient_username_doc, {
            [key]: deleteField()
         }).then(() => {console.log("Declined appointment:" + appointment_id)});
    }

    else{
        console.log("invalid command or response: " + response);
    }
}

export async function delete_appointment(username: string, appointment_id: string){
    /* 
    * Delete an appointment for the given user
    * Returns None
    */
   
    // Collections
    const profileCollection = collection(db,"Profile");

    // Profile results
    let profileSnap = await(getDoc(doc(profileCollection,username))).then((response)=>response.data());
    let profileSnap_data = null;
    if (profileSnap){
        profileSnap_data = profileSnap['schedule']['active'];
    }

    if(!profileSnap_data.hasOwnProperty(appointment_id)){
        console.log("appointment_id invalid, not found in username:" + username);
        return
    }

    const sender_username = profileSnap_data[appointment_id]['partner'];

    const sender_username_doc = doc(profileCollection,sender_username);
    const recipient_username_doc = doc(profileCollection, username);

    // remove from active section for both users
    let key = 'schedule.active.' + appointment_id;
    await updateDoc(sender_username_doc, {
        [key]: deleteField()
        });

    await updateDoc(recipient_username_doc, {
        [key]: deleteField()
        }).then(() => {console.log("Declined appointment:" + appointment_id)});
}