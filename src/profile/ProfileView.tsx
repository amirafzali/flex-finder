import React from 'react';

import { FormControl, InputLabel, OutlinedInput,  TextField, Select, MenuItem, Button} from "@mui/material";
import { useEffect, useState } from "react";

import {Container, Row, Col} from "react-bootstrap";
import { create_new_profile, get_profile_data } from "../profile/profile_functions";
import { getGyms, getSchools, getWorkoutTypes } from "../search/Search";
import {days, initialFormState} from './data';
import ProfileTimePicker, {TimeslotObject}  from './ProfileTimePicker';
import {useLocation, useNavigate} from 'react-router-dom';
import {AuthPage} from '../authenticate/AuthFlow';
import { DocumentData } from "firebase/firestore";
import {useAsyncEffect} from 'use-async-effect';

const centeredFieldStyle = {
    width: '80%',
    marginRight: '10%',
    marginLeft: '10%',
    marginBottom: 2
}

type ProfileViewStaticData = {
    schoolNames: string[],
    gymNames: string[],
    workoutNames: string[],
}

const emptyObject = Object.freeze({});

export default function ProfileView(props: any){

    const [data, setData] = useState<ProfileViewStaticData>({
        schoolNames: [],
        gymNames: [],
        workoutNames: []
    });


    // Form state
    const location: {[key: string]: any} = useLocation();
    const navigate = useNavigate();
    const username = location.state;
    const [form, setForm] = useState<DocumentData>({...initialFormState, username});

    useAsyncEffect(async (isActive) => {

        if (props.mode === AuthPage.MAIN_MENU){
            const profileData = await get_profile_data(username);
            if (!isActive()) return;

            if (profileData != null){
                console.log(profileData);
                setForm(profileData);
            }
        }  

        const [schoolNames, gymNames, workoutNames] = await Promise.all([
            getSchools(),
            getGyms(),
            getWorkoutTypes()
        ]);

        if (!isActive()) return;

        setData({
            schoolNames: Object.keys(schoolNames ?? emptyObject),
            gymNames: Object.keys(gymNames ?? emptyObject),
            workoutNames: Object.keys(workoutNames ?? emptyObject)
        });

    }, []);

    // Error states
    const [errorState, seterrorState] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    async function onRegisterDetails(username: string, gender: string, gyms:Array<string>, school:string, workout_types:Array<string>, timeslots_available:Array<TimeslotObject>) {
        const workout_types_arr = workout_types.map(function(item) {
            return item.trim();
          });
        const gyms_arr = gyms.map(function(item) {
            return item.trim();
          });
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
        console.log(form);
        setForm({ ...form, [field]: event.target.value });
    };
 
    const onChangeTimeslots = (field: string, value: string) => {
        setForm({...form, timeslots: {...form.timeslots_available, [field]: value} });
    };

    // const assignSchoolNames = async () => {
    //     const schools = await getSchools();
    //     if (schools){
    //         setSchoolNames(Object.keys(schools));
    //     }
    // }
    // const assignGymNames = async () => {
    //     const gyms = await getGyms();
    //     if (gyms){
    //         setGymNames(Object.keys(gyms));
    //     }
    // }
    // const assignWorkoutNames = async () => {
    //     const Workout_Types = await getWorkoutTypes();
    //     if (Workout_Types){
    //         setWorkoutNames(Object.keys(Workout_Types));
    //     }
    // }

    const setFormState = async () => {
        const profileData = await get_profile_data(location.state);
        if (profileData !== null){
            console.log(profileData);
            setForm(profileData);
        }
    }


    // update initially
    useEffect(() => {     
        // TODO @shazil-arif below might not be correct functionality but the commented
        //  section above was calling setSchoolNames(), etc. which isn't in this file
        (async () => {
            if (props.mode === AuthPage.MAIN_MENU){
                setFormState()
            }
            
            const schools = await getSchools();
            const gyms = await getGyms();
            const Workout_Types = await getWorkoutTypes(); 
            setData({
                schoolNames: Object.keys(schools ?? emptyObject),
                gymNames: Object.keys(gyms ?? emptyObject),
                workoutNames: Object.keys(Workout_Types ?? emptyObject)
            });
        })();

        // eslint-disable-next-line
    }, []);

    return(        
        <Container>
            <h1 style={{color:"red", display: errorState ? 'none' : 'inline'}}>{errorMsg}</h1>
            
            <h3 style={{textAlign: 'center'}}>Enter Details in lowercase!</h3>

            <FormControl sx={centeredFieldStyle} variant="outlined">

                <TextField
                label="Username"
                size="small"
                type='text'
                value={form.username}
                onChange={onChange('username')}
                />
             </FormControl>

            <FormControl sx={centeredFieldStyle}>
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

            <FormControl sx={centeredFieldStyle}>
                <InputLabel id="demo-multiple-name-label">School</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                value={form.school}
                onChange={onChange('school')}
                input={<OutlinedInput label="school" />}
                >
                {data.schoolNames.map((item) => (
                    <MenuItem
                    key={item}
                    value={item}
                    >
                    {item}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>

            <FormControl sx={centeredFieldStyle}>
                <InputLabel id="demo-multiple-name-label">Gyms - Select for ONLY your school</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple
                value={[form.gyms]}
                onChange={onChange('gyms')}
                input={<OutlinedInput label="Gyms" />}
                >
                {data.gymNames.map((item) => (
                    <MenuItem
                    key={item}
                    value={item}
                    >
                    {item}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>

            <FormControl sx={centeredFieldStyle}>
                <InputLabel id="demo-multiple-name-label">Workout Types</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple
                // TODO handle this in a cleaner way
                value={props.mode === AuthPage.MAIN_MENU ? [form.workout_types] : form.workout_types}
                onChange={onChange('workout_types')}
                input={<OutlinedInput label="workout types" />}
                >
                {data.workoutNames.map((item) => (
                    <MenuItem
                    key={item}
                    value={item}
                    >
                    {item}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>


            <div style={centeredFieldStyle}>

            <InputLabel id="time-availability">Time Availability</InputLabel>

                <FormControl variant='filled' size="medium" sx={{ width: '100%', marginBottom: 2, marginRight: 3}}>
                    <InputLabel id="demo-simple-select-label">Day</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        // TODO handle this in a cleaner way
                        value={props.mode === AuthPage.MAIN_MENU ? [form.timeslots_available.day] : form.timeslots_available.day}
                        onChange={(event: any) => onChangeTimeslots('day', event.target.value)}
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

            
            </div>
        
            <Row style={{marginLeft: '10%', marginRight: '10%', marginBottom: '5%'}}>
                <Col style={{paddingLeft: 0, paddingRight: 20}}>
                    <ProfileTimePicker label="Start Time" identifier="start_time" onChange={onChangeTimeslots}/>
                </Col>
                <Col style={{paddingLeft: 0, paddingRight: 0}}>
                    <ProfileTimePicker label="End Time" identifier="end_time" onChange={onChangeTimeslots}/>
                </Col>
            </Row>

            
            <Row style={centeredFieldStyle}>
                <Col style={{textAlign: 'center'}}>
                    <Button
                        sx={{width: '100%', maxWidth: '150px'}}
                        variant="contained"
                        onClick={() => {navigate("/mainmenu", {state: username})}}
                        >
                            Go Back
                    </Button>
                </Col>
                <Col style={{textAlign: 'center'}}>
                    <Button
                        sx={{width: '100%', maxWidth: '150px'}}
                        variant="contained" color='success'
                        onClick={() => {console.log("SUBMIT pressed\n", form);
                        onRegisterDetails(form.username, form.gender, form.gyms, form.school, form.workout_types, [form.timeslots_available])}}
                    >
                        Submit
                    </Button>
                </Col>
            </Row>
        </Container>

    )
}