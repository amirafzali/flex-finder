/**
 * File: SearchView.tsx
 * Date: January 1st, 2021
 * Details: VIEW FUNCTIONS: Search Views to search for users and display results to view profiles.
*/

import { useEffect, useState } from "react";
import {FormControl, InputLabel, OutlinedInput, TextField, Select, MenuItem, Card, CardContent, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import {Container, Row, Col} from "react-bootstrap";
import { getGyms, getSchools, getWorkoutTypes, search_function } from "./Search";
import { useNavigate, useLocation } from "react-router-dom";

enum SearchPage {
    SEARCH,
    RESULTS
}

export default function SearchScreen(props:any){
    const location:{ [key: string]: any } = useLocation(); // Used for accessing username props
    const [username, setUsername]= useState(location.state); // assign username prop, aka state
    const navigate = useNavigate();

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
    const onChange = (field: string) => (event: any) => {
        setForm({ ...form, [field]: event.target.value });
    };

    const onChangeTimeslots = (field: string) => (event: any) => {
        setForm({ ...form, timeslots: {...form.timeslots, [field]:event.target.value} });
    };

    const display_results = (username:string, gym:string, school:string, workout_type:string, timeslots:{day:string, start_time:string, end_time:string}) => {
        // retrieve the results and intent to results page to view them
        search_function(username, gym, school, workout_type, timeslots).then((response) => {console.log(props);props.goToResults(response);});
        
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
        Search for FlexUsers!
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
                onClick={() => {navigate("/mainmenu", {state: username})}}
                >
                    Go Back
                </Button>
             </Col>
        </Row>

    </Container>
            
    )
}

export function SearchResultsScreen(props: any){
    const [searchResult, setsearchResult] = useState<Set<any>>(props.searchResult);
    console.log(searchResult);

    return(
        <Container className="align-items-center">
        <ul className="list-group">
        {(Array.from(searchResult)).map((item:string) => {
                return (

                    <Container key={item}>
                    <Row>
                    <Col>
                        <Card sx={{ minWidth: 280, marginTop: 1 }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Username: {item}
                                </Typography>
                            </CardContent>
                            <CardContent>
                            <Button 
                                    size="small"
                                    sx={{width: '70%', marginBottom: 1, marginLeft: 4}}
                                    variant="contained" 
                                    color="success"
                                    onClick={() => alert("Profile Viewer still in development...")}>View Profile
                            </Button>
                            </CardContent>
                        </Card>
                    </Col>
                    </Row>
                    </Container>
                );
            })}
        </ul>
        <br/>
        <Button 
        variant="contained" 
        sx={{width: '50%', marginBottom: 6, marginLeft: 4}}
        onClick={() => props.goToSearch()}
        >
            Go back
        </Button>
        </Container>
    )
}