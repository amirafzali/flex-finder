/**
 * File: profile_functions.tsx
 * Date: January 1st, 2021
 * Details: LOGIC FUNCTIONS: to trigger profile related changes/commands to firebase (Create, edit, get, validate_inputs, etc)
*/

import { collection, Firestore, getDoc, doc, getDocs, updateDoc, deleteField, setDoc, arrayUnion } from "firebase/firestore"; 

import { db } from "../firebase/firebase";
import {search_by_timeslot} from "../search/Search"
import {v4 as uuidv4} from "uuid"
import { DocumentData } from "firebase/firestore";


interface timeslot_object {
    day: string,
    start_time: string,
    end_time: string,
}

export async function load_existing_user(uid: string){
    const uidCollection = collection(db,"uid");
    console.log(uidCollection);
    
    const username = await getDoc(doc(uidCollection, uid)).then((res) => res.data());

    if (username){
        return username['username'];
    }

    return null;
}

export async function update_profile(username: string, gender: string, gyms:Array<string>, school:string, workout_types:Array<string>, timeslots_available:Array<timeslot_object>, uid: string){
    const profileCollection = collection(db,"Profile");
     // Pre-processing
    let timeslots_of_dicts:{ [key: string]: any } = {}
    for (let i = 0; i<timeslots_available.length; i++){
        let timeslot = timeslots_available[i];
        timeslots_of_dicts[i.toString()] = timeslot;
    }

    // TODO: This might be wrong for update_profile

    const schedule = {"active": null, "pending": null};
    const data = {
        "Gender": gender,
        "Gyms": gyms,
        "School": school,
        "Workout_types": workout_types,
        "timeslots_available": timeslots_of_dicts,
        "schedule": schedule
    }
    await updateDoc(doc(profileCollection, username), data);
    console.log("user: " + username + " successfully updated!");
    return [true, "success"];

}

export async function create_new_profile(username: string, gender: string, gyms:Array<string>, school:string, workout_types:Array<string>, timeslots_available:Array<timeslot_object>, uid: string){
    
    // validate inputs
    const res = await validate_inputs(username, gender, gyms, school, workout_types, timeslots_available)
    if (res[0] === false){
        return res;
    }

    // Pre-processing
    let timeslots_of_dicts:{ [key: string]: any } = {}
    for (let i = 0; i<timeslots_available.length; i++){
        let timeslot = timeslots_available[i];
        timeslots_of_dicts[i.toString()] = timeslot;
    }

    const schedule = {"active": null, "pending": null};
    const data = {
        "Gender": gender,
        "Gyms": gyms,
        "School": school,
        "Workout_types": workout_types,
        "timeslots_available": timeslots_of_dicts,
        "schedule": schedule
    }

    // Collections
    const profileCollection = collection(db,"Profile");
    const searchCollection = collection(db,"Search");
    const uidCollection = collection(db,"uid");

    // push changes to profile collection
    await setDoc(doc(profileCollection, username), data);

    // push changes to search collection
    for (const gym of gyms){
        // insert into Search --> gym
        await updateDoc(doc(searchCollection, 'gym'), {[gym]: arrayUnion(username)});

        // insert into Search --> gym
        await updateDoc(doc(searchCollection, 'school'), {[school]: arrayUnion(username)});
    }

    for (const workout_type of workout_types){
        // insert into Search --> workout_type
        await updateDoc(doc(searchCollection, 'workout_type'), {[workout_type]: arrayUnion(username)});
    }

    // link uid with username in uid collection
    await setDoc(doc(uidCollection, uid), {"username": username});

    console.log("user: " + username + " successfully created!");
    return [true, "success"];
}



// TODO
export async function edit_profile(username: string, field: string, value: any){

}



export async function get_profile_data(username: string) : Promise<DocumentData | null>{
    // Collections
    const profileCollection = collection(db,"Profile");
    // Profile Documents
    const profileDocument = doc(profileCollection,username);
    // data
    let profileData = await(getDoc(profileDocument)).then((response)=>response.data())

    // PRE-CONDITION CHECKS
    // Valid username
    if (profileData === null){
        console.log(username + " is invalid target username. Please use a valid username");
        return null;
    }

    if (profileData){
        return profileData;
    }
    return null;
}


async function validate_inputs(username: string, gender: string, gyms:Array<string>, school:string, workout_types:Array<string>, timeslots_available:Array<timeslot_object>){
    
    username = username.toLowerCase().trim();
    console.log(gender);
    gender = gender.toLowerCase().trim();
    
    // Collections
    const profileCollection = collection(db,"Profile");
    const searchCollection = collection(db,"Search");

    const profileData = await (getDoc(doc(profileCollection,username))).then((response)=>response.data())

    // validate username - check if already exists!
    if ((profileData) || (typeof profileData === 'undefined') || (typeof profileData === null)){
        console.log(profileData);
        console.log(username + " is invalid/or already taken. Please try another.");
        return [false, username + " is invalid/or already taken. Please try another."]
    }

    // validate gender
    if (['m', 'f', 'other'].includes(gender) === false){
        console.log(gender + "is invalid");
        return [false, gender + "is invalid"]
    }

    // validate workout_types
    for (const workout_type of workout_types){
        const search_workout_type = await (getDoc(doc(searchCollection,"workout_type"))).then((response)=>response.data())

        if (search_workout_type){
            if (search_workout_type.hasOwnProperty(workout_type) === false){
                console.log(workout_type + "is invalid");
                return [false, workout_type + "is invalid"];
            }
        }
    }

    // validate school
    const search_school = await (getDoc(doc(searchCollection,"school"))).then((response)=>response.data())
    if (search_school){
        if(search_school.hasOwnProperty(school) === false){
            console.log(school + "is invalid");
            return [false, school + "is invalid"];
        }
    }

    // validate gym
    for (const gym of gyms){
        const search_gym = await (getDoc(doc(searchCollection,"gym"))).then((response)=>response.data())

        if (search_gym){
            if (search_gym.hasOwnProperty(gym) === false){
                console.log(gym + "is invalid");
                return [false, gym + "is invalid"];
            }
        }
    }

    // validate timeslots
    const valid_days = ['mon', 'tues', 'wed', 'thurs', 'fri', 'sat', 'sun'];
    for (const timeslot of timeslots_available){
        const timeslot_start_time = Number(timeslot.start_time);
        const timeslot_end_time = Number(timeslot.end_time);

        if (valid_days.includes(timeslot.day) === false){
            console.log(timeslot.day + "is invalid day");
                return [false, timeslot.day + "is invalid day"];
        }

        if (!((timeslot_start_time >= 0) && (timeslot_start_time<=23) &&(timeslot_end_time > timeslot_start_time))){
            console.log(timeslot.start_time + "is invalid start time");
                return [false, timeslot.start_time + "is invalid start time. End must be greater than start."];
        }

        if (!((timeslot_end_time >= 0) && (timeslot_end_time<=23) &&(timeslot_end_time > timeslot_start_time))){
            console.log(timeslot.end_time + "is invalid end time. End must be greater than start.");
                return [false, timeslot.end_time + "is invalid end time"];
        }
    }

    return [true, "success"];


    

}
