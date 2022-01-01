/**
 * File: Search.ts
 * Date: January 1st, 2021
 * Details: LOGIC FUNCTIONS: Handles the search queries with FireStore to return appropriate results
*/

import { collection, Firestore, getDoc, doc, getDocs } from "firebase/firestore"; 

import { db } from "../firebase/firebase";

interface timeslot_object {
    day: string,
    start_time: string,
    end_time: string,
}

const intersectSets = (a: Set<string>, b: Set<string>): Set<string> => {
    const c: Set<string> = new Set();
    a.forEach(v => b.has(v) && c.add(v));
    return c;
}

const unionSets = (a: Set<any>, b: Set<any>): Set<string> => {
    const union: Set<string> = new Set(a);
    for (const elem of Array.from(b)) {
        union.add(elem);
    }

    return union;
}

export async function search_function(username: string = "", gym: string = "", school: string = "", workout_type: string = "", timeslots: timeslot_object) {
    let users:Set<string> = new Set()

    // Search via username
    const profileCollection = collection(db,"Profile");
    if (username) {
        let profileRef = doc(profileCollection, username)
        let profileSnap = await getDoc(profileRef)

        if (profileSnap.exists()) {
            users.add(username);
          } else {
            console.log("No such document!");
          }
    }

    // Search via school, gym, workout_type, time interval
    const searchCollection = collection(db, "Search");

    // documents data - School Search
    const search_school_ref = doc(searchCollection, 'school');
    const search_school_doc  = await getDoc(search_school_ref );
    let search_school_data_object  = search_school_doc.data();
    let search_school_data_array = null;
    if (search_school_data_object){
        search_school_data_array = (typeof search_school_data_object[school] === 'undefined') ? null : search_school_data_object[school];
    }

    // Gym Search
    const search_gym_ref = doc(searchCollection, "gym");
    const search_gym_doc  = await getDoc(search_gym_ref );
    let search_gym_data_object  = search_gym_doc.data()
    let search_gym_data_array = null;
    if (search_gym_data_object){
        search_gym_data_array = (typeof search_gym_data_object[gym] === 'undefined') ? null : search_gym_data_object[gym];
    }

    // Workout type search
    const search_workout_type_ref = doc(searchCollection, "workout_type")
    const search_workout_type_doc  = await getDoc(search_workout_type_ref )
    let search_workout_type_data_object  = search_workout_type_doc.data();
    let search_workout_type_data_array = null;
    if (search_workout_type_data_object){
        search_workout_type_data_array = (typeof search_workout_type_data_object[workout_type] === 'undefined') ? null : search_workout_type_data_object[workout_type];
    }


    if ((search_gym_data_array) && (search_school_data_array) && (search_workout_type_data_array)){
        let temp = intersectSets(new Set(search_workout_type_data_array), new Set(search_school_data_array));
        temp = intersectSets(temp, new Set(search_gym_data_array));

        users = unionSets(users, temp);
    }

    else if (search_gym_data_array && search_school_data_array){ 
        let temp = intersectSets(new Set(search_gym_data_array), new Set(search_school_data_array));
        users = unionSets(users, temp);
    }

    else if (search_school_data_array && search_workout_type_data_array){
        let temp = intersectSets(new Set(search_school_data_array), new Set(search_workout_type_data_array));
        if (users.size > 0) {
            users = intersectSets(users,temp);
        }
        else{
            users = unionSets(users, temp);
        }


    }

    else if (search_gym_data_array){
        
        if (users.size > 0) {
            users = users = intersectSets(users, new Set(search_gym_data_array));
        }
        else{
            users = unionSets(users, new Set(search_gym_data_array));
        }
    }

    else if (search_school_data_array){
        
        if (users.size > 0) {
            users = users = intersectSets(users, new Set(search_school_data_array));
        }
        else{
            users = unionSets(users, new Set(search_school_data_array));
        }
    }

    else if (search_workout_type_data_array){
        
        if (users.size > 0) {
            users = users = intersectSets(users, new Set(search_workout_type_data_array));
        }
        else{
            users = unionSets(users, new Set(search_workout_type_data_array));
        }
    }

    // TODO: get the value from promise
    if (( (timeslots['day'] != "") && (Number(timeslots['start_time']) > -1) && (Number(timeslots['end_time']) > -1)) && users){
        let users_ = search_by_timeslot(users,timeslots);
        return users_;
    }

    console.log(users);
    return users

}

export async function search_by_timeslot(users:Set<string>, timeslot:timeslot_object){

    let valid_users:Set<string> = new Set();
    const profileCollection = collection(db,"Profile");
    const day = timeslot['day'];
    const start_hour = Number(timeslot['start_time']);
    const end_hour = Number(timeslot['end_time']);

    for (const user of Array.from(users)){
        let profileRef = doc(profileCollection, user)
        let profileSnap = await getDoc(profileRef)
        let profileData = profileSnap.data()

        if (profileData) {
            let avail_user_timeslots:Map<string,any> = profileData['timeslots_available'];

            for (const [_, user_timeslot] of Object.entries(avail_user_timeslots)){
                let user_day = user_timeslot['day'];
                let start_time = user_timeslot['start_time'];
                let end_time = user_timeslot['end_time'];

                // console.log([user_day,day],[start_time, start_hour], [end_time, end_hour]);
                if ((user_day == day) && (start_time == start_hour) && (end_time == end_hour)){
                    valid_users.add(user);
                    // console.log("RAN");
                    break;
                }
            }
        }
    }
        

    console.log(valid_users)
    return valid_users;
}

export async function getSchools(){
    // collection
    const searchCollection = collection(db,"Search");

    // data
    const search_object = await(getDoc(doc(searchCollection,"school"))).then((response)=>response.data());
    if (search_object){
        return search_object;
    }
    else{
        return null
    }
}

export async function getGyms(){
    // collection
    const searchCollection = collection(db,"Search");

    // data
    const search_object = await(getDoc(doc(searchCollection,"gym"))).then((response)=>response.data());
    if (search_object){
        return search_object;
    }
    else{
        return null
    }
}

export async function getWorkoutTypes(){
    // collection
    const searchCollection = collection(db,"Search");

    // data
    const search_object = await(getDoc(doc(searchCollection,"workout_type"))).then((response)=>response.data());
    if (search_object){
        return search_object;
    }
    else{
        return null
    }
}