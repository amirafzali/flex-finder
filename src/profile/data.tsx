import { DocumentData } from "firebase/firestore";

// UI selectable dropdown states
 export const days = [
    {label: 'None', value: ""},
    {label: 'mon', value: 'mon'},
    {label: 'tues', value: 'tues'},
    {label: 'wed', value: 'wed'},
    {label: 'thurs', value: 'thurs'},
    {label: 'fri', value: 'fri'},
    {label: 'sat', value: 'sat'},
    {label: 'sun', value: 'sun'},
];

export const initialFormState : DocumentData = {
    username: "",
    gyms: [],
    gender: "",
    school: "",
    workout_types: [],
    timeslots_available:{
        day: "",
        start_time: 11,
        end_time: 12
    }
}