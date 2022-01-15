/**
 * File: AuthFlow.js
 * Date: January 1st, 2021
 * Details: FLOW/CONTROLLER FUNCTIONS: Controller to navigate between the AuthViews of Register,Login, RegisterDetails
*/

import Paper from '@mui/material/Paper';
import { useNavigate } from "react-router-dom";
import Login from "./Login"

import { useState } from "react";
import { FormControl,  TextField} from "@mui/material";
import Button from "@mui/material/Button";
import { create_user } from "./fb-functions";

import ProfileView from '../profile/ProfileView';

export enum AuthPage {
    LOGIN,
    REGISTER,
    REGISTER_DETAILS,
    MAIN_MENU // post authentication - selection options(ie; scheduler, etc)
}

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
    
    return (
        <Paper elevation={12} id="auth-box">
            <h1 id="auth-title">Profile Details</h1>
            {page === AuthPage.LOGIN && <Login goToRegister={goToRegister} goToMainMenu={goToMainMenu}/>}
            {page === AuthPage.REGISTER && <Register goToLogin={goToLogin} goToRegisterDetails={goToRegisterDetails}/>}
            {page === AuthPage.REGISTER_DETAILS && <ProfileView uid={uid} goToMainMenu={goToMainMenu}/>}
        </Paper>
    )
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