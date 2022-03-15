import React from 'react';

import { FormControl, InputLabel, OutlinedInput,  TextField, Select, MenuItem, Button} from "@mui/material";
import { useEffect, useState } from "react";

import {Container, Row, Col} from "react-bootstrap";
import { create_new_profile, get_profile_data, update_profile } from "../profile/profile_functions";
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

    const [data, setData] = useState<ProfileViewStaticData>({ // this is just static data to be selected from the drop downs
        schoolNames: [],
        gymNames: [],
        workoutNames: []
    });

    // Form state
    const location: {[key: string]: any} = useLocation();
    const navigate = useNavigate();
    const goToMainMenu = () => {
        navigate("/mainmenu", {state: username ?? form.username});
    }

    const username = location.state;
    const [form, setForm] = useState<DocumentData>({...initialFormState, username});

    const anyFormFieldIsntLoaded = () => {
        console.log(form);
        const values = Object.values(form);
        for (const value of values){
            if (value && value.hasOwnProperty('length') && value.length === 0){
                return true;
            }
        }
        return false;
    }


    useEffect(() => {

        if (props.mode === AuthPage.MAIN_MENU){
            const profileData = get_profile_data(username).then(profileData => {
                if (profileData != null){
                    // bandage fix, get max key for timeslots
                    const getIntKeys = () : Array<number> => {
                        const keys = Object.keys(profileData.timeslots_available);
                        let newKeys : Array<number> = [];
                        for (const key of keys){
                            newKeys.push(parseInt(key));
                        }
                        return newKeys;
                    }
                    const getMax = () => {
                        return Math.max.apply(null, getIntKeys());
                    }
                    // there is a descrepancy between field names in the form versus what the firebase record returns... some fields are capitalized in the retrieved firebase records
                    setForm({
                        username,
                        gyms: profileData.Gyms,
                        gender: profileData.Gender,
                        school: profileData.School,
                        workout_types: profileData.Workout_types,
                        timeslots_available: profileData.timeslots_available[getMax()]
                    });
                }
            });
        }  

        Promise.all([
            getSchools(),
            getGyms(),
            getWorkoutTypes()
        ]).then(([schoolNames, gymNames, workoutNames]) => {
            setData({
                schoolNames: Object.keys(schoolNames ?? emptyObject),
                gymNames: Object.keys(gymNames ?? emptyObject),
                workoutNames: Object.keys(workoutNames ?? emptyObject)
            });
        })
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

        let status : Array<any>;
        if (props.mode === AuthPage.MAIN_MENU){
            status = await update_profile(username, gender, gyms_arr, school, workout_types_arr, timeslots_available, props.uid);
        }
        else{
            status = await create_new_profile(username, gender, gyms_arr, school, workout_types_arr, timeslots_available, props.uid);
        }

        if (status[0]){
            alert("Successfully built profile!");
            goToMainMenu(); // update username in AuthFlow and intent to MainMenu
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
        setForm({...form, timeslots_available: {...form.timeslots_available, [field]:event.target.value} });
    };

    const onChangeTimeRange = (field: string, value: any) => {
        console.log(field, value);
        setForm({...form, timeslots_available: {...form.timeslots_available, [field]: value} });
    }


    if (anyFormFieldIsntLoaded() && props.mode === AuthPage.MAIN_MENU){
        return <h1 style={{textAlign: 'center'}}>Loading Details....</h1>;
    }

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
                value={form.gyms}
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
                // value={props.mode === AuthPage.MAIN_MENU ? [form.workout_types] : form.workout_types}
                value={form.workout_types}
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
                        // value={props.mode === AuthPage.MAIN_MENU ? [form.timeslots_available.day] : form.timeslots_available.day}
                        value={form.timeslots_available.day}

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

            
            </div>
        
            <Row style={{marginLeft: '10%', marginRight: '10%', marginBottom: '5%'}}>
                <Col style={{paddingLeft: 0, paddingRight: 20}}>
                    <ProfileTimePicker initialValue={form.timeslots_available.start_time} label="Start Time" identifier="start_time" onChange={onChangeTimeRange}/>
                </Col>
                <Col style={{paddingLeft: 0, paddingRight: 0}}>
                    <ProfileTimePicker initialValue ={form.timeslots_available.end_time} label="End Time" identifier="end_time" onChange={onChangeTimeRange}/>
                </Col>
            </Row>

            
            <Row style={centeredFieldStyle}>
                {/* Only Render this if viewing from main menu */}
                {props.mode == AuthPage.MAIN_MENU ? 
                <Col style={{textAlign: 'center'}}>
                    <Button
                        sx={{width: '100%', maxWidth: '150px'}}
                        variant="contained"
                        onClick={goToMainMenu}
                        >
                            Go Back
                    </Button>
                </Col>
                : null}
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