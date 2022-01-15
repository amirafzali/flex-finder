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

export const hours = [
    {label: 'None', value: '-1'},
    {label: '12AM', value: '0'},
    {label: '1AM', value: '1'},
    {label: '2AM', value: '2'},
    {label: '3AM', value: '3'},
    {label: '4AM', value: '4'},
    {label: '5AM', value: '5'},
    {label: '6AM', value: '6'},
    {label: '7AM', value: '7'},
    {label: '8AM', value: '8'},
    {label: '9AM', value: '9'},
    {label: '10AM', value: '10'},
    {label: '11AM', value: '11'},
    {label: '12PM', value: '12'},
    {label: '1PM', value: '13'},
    {label: '2PM', value: '14'},
    {label: '3PM', value: '15'},
    {label: '4PM', value: '16'},
    {label: '5PM', value: '17'},
    {label: '6PM', value: '18'},
    {label: '7PM', value: '19'},
    {label: '8PM', value: '20'},
    {label: '9PM', value: '21'},
    {label: '10PM', value: '22'},
    {label: '11PM', value: '23'}
];


export const initialFormState = {
    username: "",
    gyms: [],
    gender: "",
    school: "",
    workout_types: [],
    timeslots:{
        day: "",
        start_time: "",
        end_time: ""
    }
}