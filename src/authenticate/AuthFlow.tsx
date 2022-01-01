/**
 * File: AuthFlow.js
 * Date: January 1st, 2021
 * Details: FLOW/CONTROLLER FUNCTIONS: Controller to navigate between the AuthViews of Register,Login, RegisterDetails
*/

//import {  useState } from "react";
import Paper from '@mui/material/Paper';
import { useNavigate } from "react-router-dom";
import Login from "./Login"
//import Register from "./Register"
//import RegisterDetails from "./Register"


 import { useEffect, useState } from "react";
import { FormControl, InputLabel, OutlinedInput,  TextField, Select, MenuItem} from "@mui/material";
import Button from "@mui/material/Button";
import { create_user } from "./fb-functions";
import {Container, Row, Col} from "react-bootstrap";
import { create_new_profile } from "../profile/profile_functions";
import { getGyms, getSchools, getWorkoutTypes } from "../search/Search";


interface timeslot_object {
    day: string,
    start_time: string,
    end_time: string,
}


enum AuthPage {
    LOGIN,
    REGISTER,
    REGISTER_DETAILS,
    MAIN_MENU // post authentication - selection options(ie; scheduler, etc)
}

/*
interface timeslot_object {
    day: string,
    start_time: string,
    end_time: string,
}
*/

export function AuthScreen() {
    const [page, setPage] = useState(AuthPage.LOGIN);
    const [username, setUsername] = useState<string|null>(null);
    const [uid, setUid] = useState<string|null>(null);

    const navigate = useNavigate(); 

    const goToLogin = () => setPage(AuthPage.LOGIN);
    const goToRegister = () => setPage(AuthPage.REGISTER);
    const goToRegisterDetails = (uid:string) => {setUid(uid); setPage(AuthPage.REGISTER_DETAILS)}
    const goToMainMenu = (username:string) => {
        setUsername(username); 
        navigate("/mainmenu", {state: username})
    };
    
    return <Paper elevation={12} id="auth-box">
        <h1 id="auth-title">
            FlexFinder 💪
        </h1>
        {page === AuthPage.LOGIN && <Login goToRegister={goToRegister} goToMainMenu={goToMainMenu}/>}
        {page === AuthPage.REGISTER && <Register goToLogin={goToLogin} goToRegisterDetails={goToRegisterDetails}/>}
        {page === AuthPage.REGISTER_DETAILS && <RegisterDetails uid={uid} goToMainMenu={goToMainMenu}/>}
    </Paper>
}

function Register(props: any) {

    const [uid, setUid]= useState<string|null>(null);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const onChange = (field: string) => (event: any) => {
        setForm({ ...form, [field]: event.target.value });
    };

    async function onRegister(email: string, password: string) {
        const uid = await create_user(email, password)

        if (uid){
            console.log(uid)
            setUid(uid);
            props.goToRegisterDetails(uid); // intent to screen for profile details
        }
    }
    
    return (<div className="auth-form">
    <h2 className="auth-subheader">
        Register
    </h2>
    <div className="row">
        <FormControl sx={{ width: '100%', marginBottom: 2, marginRight: 2}} variant="outlined">
            <TextField
            label="First Name"
            size="small"
            type='text'
            value={form.firstName}
            onChange={onChange('firstName')}
            />
        </FormControl>
        <FormControl sx={{ width: '100%', marginBottom: 2}} variant="outlined">
            <TextField
                label="Last Name"
                size="small"
                type='text'
                value={form.lastName}
                onChange={onChange('lastName')}
            />
        </FormControl>
    </div>
    <FormControl sx={{ width: '100%', marginBottom: 2}} variant="outlined">
        <TextField
            label="Email"
            size="small"
            type='email'
            value={form.email}
            onChange={onChange('email')}
        />
    </FormControl>
    <FormControl sx={{ width: '100%', marginBottom: 2}} variant="outlined">
        <TextField
            label="Password"
            size="small"
            type='password'
            value={form.password}
            onChange={onChange('password')}
        />
    </FormControl>
    <FormControl sx={{ width: '100%', marginBottom: 2}} variant="outlined">
        <TextField
            label="Confirm Password"
            size="small"
            type='password'
            value={form.confirmPassword}
            onChange={onChange('confirmPassword')}
        />
    </FormControl>
    <Button 
    variant="contained"
    sx={{width: '100%', marginBottom: 3}}
    onClick={() => onRegister(form.email, form.password)}
    >
        Register
    </Button>
    <hr className="line-sep"/>
    <p className="auth-text">Already have an account? 
        <span className="text-link" onClick={() => props.goToLogin()}> Sign in!</span>
    </p>
</div>)
}

function RegisterDetails(props:any){

    // UI selectable dropdown states
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

    // Forms states
    const [form, setForm] = useState({
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
    });

    // Error states
    const [errorState, seterrorState] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    async function onRegisterDetails(username: string, gender: string, gyms:Array<string>, school:string, workout_types:Array<string>, timeslots_available:Array<timeslot_object>) {
        const workout_types_arr = workout_types.map(function(item) {
            return item.trim();
          });;
        const gyms_arr = gyms.map(function(item) {
            return item.trim();
          });;
        const status:Array<any> = await create_new_profile(username, gender, gyms_arr, school, workout_types_arr, timeslots_available, props.uid)

        if (status[0]){
            alert("Successfully built profile!");
            props.goToMainMenu(username); // update username in AuthFlow and intent to MainMenu
        }
        else{
            // error state active
            seterrorState(true);
            setErrorMsg(status[1]);
        }
    }

    const onChange = (field: string) => (event: any) => {
        setForm({ ...form, [field]: event.target.value });
    };
 
    const onChangeTimeslots = (field: string) => (event: any) => {
        setForm({...form, timeslots: {...form.timeslots, [field]:event.target.value} });
    };

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
            {errorState && <h1 style={{color:"red"}}>{errorMsg}</h1>}
            <h2>
            Account Details Form
            </h2>
            <h3>Enter Details in lowercase!</h3>
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
                <InputLabel id="demo-multiple-name-label">Gender</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                value={form.gender}
                onChange={onChange('gender')}
                input={<OutlinedInput label="gender" />}
                >
                {["m","f", "other"].map((item) => (
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
                <InputLabel id="demo-multiple-name-label">Gyms - Select for ONLY your school</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple
                value={form.gyms}
                onChange={onChange('gyms')}
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
                multiple
                value={form.workout_types}
                onChange={onChange('workout_types')}
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
             Enter Timeslot Available:
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
                    onClick={() => {console.log("SUBMIT pressed\n", form); onRegisterDetails(form.username, form.gender, form.gyms, form.school, form.workout_types, [form.timeslots])}}
                    >
                        Submit
                    </Button>
                 </Col>
            </Row>

        </Container>

    )
}