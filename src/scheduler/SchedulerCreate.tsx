/**
 * File: SchedulerCreate.tsx
 * Date: January 1st, 2021
 * Details: VIEW FUNCTIONS: Scheduler views to create appointments by populating users for given criteria(username, school, gym, etc)
*/

import { useState, useEffect } from "react";
import { Box, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, TextField, Select, MenuItem, Card, CardActions, CardContent,Typography} from "@mui/material";
import Button from "@mui/material/Button";
import {Container, Row, Col} from "react-bootstrap";
import { getGyms, getSchools, getWorkoutTypes, search_function } from "../search/Search";
import { get_requests, send_request, respond_requests, delete_appointment } from "./scheduler_functions";
import { get_profile_data } from "../profile/profile_functions";
import { useLocation } from "react-router-dom";

enum SchedulerPages {
    HOME,
    VIEW,
    CREATE,
    ACTIVE,
    PENDING,
    CREATE_SEARCH_RESULTS,
}

export function SchedulerCreate(props: any){

    // UI dropdown component props
    const days = [
        {label: 'None', value: ""},
        {label: 'mon', value: 'mon'},
        {label: 'tues', value: 'tues'},
        {label: 'wed', value: 'wed'},
        {label: 'thurs', value: 'thurs'},
        {label: 'fri', value: 'fri'},
        {label: 'sat', value: 'sat'},
        {label: 'sun', value: 'sun'},
    ];

    const hours = [
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

    const [schoolNames, setSchoolNames] = useState<Array<string>>([""]);
    const [gymNames, setGymNames] = useState<Array<string>>([""]);
    const [workoutNames, setWorkoutNames] = useState<Array<string>>([""]);

    // Form input props
    const [form, setForm] = useState({
        username: "",
        gym: "",
        school: "",
        workout_type: "",
        timeslots:{
            day: "",
            start_time: "",
            end_time: ""
        }
    });


    // error msg prop
    const [errorMsg, setErrorMsg] = useState(null);

    const onChange = (field: string) => (event: any) => {
        setForm({ ...form, [field]: event.target.value });
    };

    const onChangeTimeslots = (field: string) => (event: any) => {
        setForm({ ...form, timeslots: {...form.timeslots, [field]:event.target.value} });
    };

    const display_results = (username:string, gym:string, school:string, workout_type:string, timeslots:{day:string, start_time:string, end_time:string}) => {
        // retrieve the results and intent to results page to view them
        search_function(username, gym, school, workout_type, timeslots).then((data_response) => {props.goToCreateSearchResults(data_response);});
        
    }

    const assignSchoolNames = async () => {
        const schools = await getSchools();
        if (schools){
            setSchoolNames(Object.keys(schools));
        }
    }

    const assignGymNames = async () => {
        const gyms = await getGyms();
        if (gyms){
            setGymNames(Object.keys(gyms));
        }
    }

    const assignWorkoutNames = async () => {
        const Workout_Types = await getWorkoutTypes();
        if (Workout_Types){
            setWorkoutNames(Object.keys(Workout_Types));
        }
    }
    
    
    // update initially
    useEffect(() => {
        assignSchoolNames();
        assignGymNames();
        assignWorkoutNames();
        }, []);



    return(
        <Container>
            <h2>
            Create new appointment requests
            </h2>
            <h3>
            Filter Options: Fill in any of the below fields to find potential candidates!
            </h3>
            <FormControl sx={{ width: '100%', marginBottom: 2, marginRight: 2}} variant="outlined">
                <TextField
                label="Username"
                size="small"
                type='text'
                value={form.username}
                onChange={onChange('username')}
                />
             </FormControl>
             <FormControl sx={{ width: '100%', marginBottom: 2, marginRight: 2}}>
                <InputLabel id="demo-multiple-name-label">School</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                value={form.school}
                onChange={onChange('school')}
                input={<OutlinedInput label="school" />}
                >
                {schoolNames.map((item) => (
                    <MenuItem
                    key={item}
                    value={item}
                    >
                    {item}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl sx={{ width: '100%', marginBottom: 2, marginRight: 2}}>
                <InputLabel id="demo-multiple-name-label">Gyms</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                value={form.gym}
                onChange={onChange('gym')}
                input={<OutlinedInput label="Gyms" />}
                >
                {gymNames.map((item) => (
                    <MenuItem
                    key={item}
                    value={item}
                    >
                    {item}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl sx={{ width: '100%', marginBottom: 2, marginRight: 2}}>
                <InputLabel id="demo-multiple-name-label">Workout Types</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                value={form.workout_type}
                onChange={onChange('workout_type')}
                input={<OutlinedInput label="workout types" />}
                >
                {workoutNames.map((item) => (
                    <MenuItem
                    key={item}
                    value={item}
                    >
                    {item}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
             Enter Timeslots:
             <Row>

                 <Col>
                    <FormControl variant='filled' size="medium" sx={{ width: '100%', marginBottom: 2, marginRight: 3}}>
                    <InputLabel id="demo-simple-select-label">day</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={form.timeslots.day}
                        onChange={onChangeTimeslots('day')}
                        label="day"
                    >
                        {days.map((option) => {
                            return (
                                <MenuItem key={option.value} value={option.value}>
                                {option.label}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    </FormControl>
                 </Col>
                 <Col>
                    <FormControl variant='filled' size="medium" sx={{ width: '100%', marginBottom: 2, marginRight: 4, marginLeft: 4}}>
                    <InputLabel id="demo-simple-select-label">start time</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={form.timeslots.start_time}
                        onChange={onChangeTimeslots('start_time')}
                        label="start_time"
                    >
                        {hours.map((option) => {
                            return (
                                <MenuItem key={option.value} value={option.value}>
                                {option.label}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    </FormControl>
                 </Col>
                 <Col>
                    <FormControl variant='filled' size="medium" sx={{ width: '100%', marginBottom: 2, marginLeft: 8}}>
                    <InputLabel id="demo-simple-select-label">end time</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={form.timeslots.end_time}
                        onChange={onChangeTimeslots('end_time')}
                        label="start_time"
                    >
                        {hours.map((option) => {
                            return (
                                <MenuItem key={option.value} value={option.value}>
                                {option.label}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    </FormControl>
                 </Col>
             </Row>
             <Row>
                <Col>
                    <Button 
                    variant="contained" color='success' 
                    sx={{width: '70%', marginLeft: 4}}
                    onClick={() => {console.log("SUBMIT pressed\n", form); display_results(form.username, form.gym, form.school, form.workout_type, form.timeslots)}}
                    >
                        Submit
                    </Button>
                 </Col>
                 <Col>
                    <Button 
                    variant="contained" 
                    sx={{width: '70%', marginLeft: 7}}
                    onClick={() => {console.log("BACK pressed from create appointments"); props.goToHome()}}
                    >
                        Go Back
                    </Button>
                 </Col>
            </Row>

        </Container>

    )
}

export function SchedulerCreateSearchResults(props: any){
    const location:{ [key: string]: any } = useLocation();
    const [sender_username, setUsername] = useState<string>(location.state);

    const [searchResults, setSearchResults] = useState<Set<any>>(props.searchResults);
    const [ProfileData, setProfileData] = useState<Map<string, any>>(new Map());

    const [form, setForm] = useState({
        gym: "",
        workout_type: "",
        timeslots: "" // day,start_hour,end_hour --> eg: "mon,1,2", "mon,13,18"
    });

    const [submitSuccess, setSubmitSuccess] = useState<Number>(0); // 0:default, 1:Success, 2: FAIL
    const [errorMsg, setErrorMsg] = useState<string|null>(null);

    const add = (key: string, value: any) => {
        setProfileData((prev) => new Map(prev).set(key, value));
      }

    const setSearchResults_profiledata = (searchResults_:Set<string>) => {

        const searchResultsArr = Array.from(searchResults_);
        for (var i = 0; i<searchResultsArr.length; i++){
            const username = searchResultsArr[i];
            get_profile_data(username).then((result) => {
                if (result) {
                    add(username, {
                        "gym": result['Gyms'],
                        "workout_types": result['Workout_types'],
                        "timeslots_available": result['timeslots_available'],
                        "School": result["School"]
                    })

                }

                console.log(ProfileData);
            })
        }
    }

    // update initially
    useEffect(() => {
        setSearchResults_profiledata(searchResults);
      }, []);

    const onChange = (field: string) => (event: any) => {
        setForm({ ...form, [field]: event.target.value });
    };

    const onChangeSubmit = (recipient_username:string, workout_type:string, gym:string, timeslot:string) => {
        const timeslots_arr_split = timeslot.split(",");
        const timeslot_object = {
            "day": timeslots_arr_split[0],
            "start_time": timeslots_arr_split[1],
            "end_time": timeslots_arr_split[2]
        }
        const school =  ProfileData.get(recipient_username)["School"];
        
        send_request(sender_username, recipient_username, workout_type, school, gym, timeslot_object).then(
            (status:any) => {
                if(status[0]){
                    setSubmitSuccess(1);
                }else{
                    setSubmitSuccess(2);
                    setErrorMsg(status[1]);
                    console.log(recipient_username)
                    console.log(status[1]);
                }
            }
        )
    }

    return (
        <Container>
            {submitSuccess === 1 && <h2 style={{ color: 'green' }}>SUBMISSION SUCCESS!</h2>}
            {submitSuccess === 2 && 
            <Container>
            <h2 style={{ color: 'red' }}>Error: Submission Failed!</h2>
            <br>
            </br>
            <h3 style={{ color: 'red' }}>{errorMsg}</h3>
            </Container>

            }

            <h2>Matching Results:</h2>
            {console.log("HELLO2:", ProfileData.keys())}
            { ProfileData.size > 0 && Array.from(ProfileData.keys()).map((username:string) => {
                const data = ProfileData.get(username);
                const gyms = data['gym'];
                const timeslots_available = data['timeslots_available'];
                const workout_types = data['workout_types'];

                return (
                    <Container key={username}>
                    <Row>
                    <Col>
                        <Card sx={{ minWidth: 280, marginTop: 1 }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Username: {username}
                                </Typography>

                                {
                                    <Container>
                                    <Row>
                                    <FormControl required={true} variant='filled' size="medium" sx={{ width: '100%', marginBottom: 2, marginLeft: 2}}>
                                        <InputLabel id="demo-simple-select-label">Gym</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={form.gym}
                                            onChange={onChange('gym')}
                                            label="gym"
                                        >
                                            {gyms.map((item:string, index:Number) => {
                                                return (
                                                    <MenuItem key={item} value={item}>
                                                    {item}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                        </FormControl>

                                        <FormControl required={true} variant='filled' size="medium" sx={{ width: '100%', marginBottom: 2, marginLeft: 2}}>
                                        <InputLabel id="demo-simple-select-label">Workout_Type</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={form.workout_type}
                                            onChange={onChange('workout_type')}
                                            label="gym"
                                        >
                                            {workout_types.map((item:string, index:Number) => {
                                                return (
                                                    <MenuItem key={item} value={item}>
                                                    {item}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                    </Row>
                                    <p>Enter Timeslots:</p>
                                    <Row>
                    
                                        <Col>
                                        <FormControl required={true} variant='filled' size="medium" sx={{ width: '100%', marginBottom: 2, marginLeft: 1, marginRight: 20}}>
                                        <InputLabel id="demo-simple-select-label">Timeslot (day,time,time)</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={form.timeslots}
                                            onChange={onChange('timeslots')}
                                            label="day"
                                        >
                                            {Object.keys(timeslots_available).map((map_id:string, index:Number) => {
                                                const timestamp:string = timeslots_available[map_id].day + "," + timeslots_available[map_id].start_time + ',' + timeslots_available[map_id].end_time;
                                                return (
                                                    <MenuItem key={timestamp} value={timestamp}>
                                                    {timestamp}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                        </FormControl>
                                        </Col>
                                    </Row>
                                    </Container>
                                }
    
                                 
                            </CardContent>
                            <CardActions>
                                <Row>
                                <Col>  
                                <Button 
                                    size="small"
                                    sx={{width: '70%', marginBottom: 1, marginLeft: 8}}
                                    variant="contained" 
                                    color="success"
                                    onClick={() => {console.log("SELECTED", username); onChangeSubmit(username, form.workout_type, form.gym, form.timeslots)}}>Submit</Button>
                                </Col>
                                </Row>
                            </CardActions>
                    </Card>
                    </Col>
                </Row>
                </Container>
                    );            
                            
                }) 
                                
            }
            {searchResults.size <= 0 && <Container>
                <h3>No Results found 🙁</h3>
            </Container>
            
            }
            <Row>
                <Col>
                    <Button 
                    variant="contained" 
                    sx={{width: '70%', marginTop: 2, marginLeft: 7}}
                    onClick={() => {console.log("BACK pressed"); props.goToCreate()}}
                    >
                        Go Back
                    </Button>
                 </Col>
                 <Col>
                 <Button 
                    variant="contained" 
                    sx={{width: '70%', marginTop: 2, marginLeft: 7}}
                    onClick={() => {setProfileData(ProfileData)}}
                    >
                        Refresh
                    </Button>
                 </Col>
            </Row>
        </Container>
    )
}
