/**
 * File: Login.tsx
 * Date: January 1st, 2021
 * Details: VIEW FUNCTIONS: Login View component
*/

import { useState } from "react";
import { Box, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton,} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Button from "@mui/material/Button";
import { login_user, } from "./fb-functions";

enum AuthPage {
    LOGIN,
    REGISTER,
    REGISTER_DETAILS,
    MAIN_MENU
}

interface timeslot_object {
    day: string,
    start_time: string,
    end_time: string,
}

export default function Login(props: any) {
    console.log(props)
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername]= useState(null);
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const onChange = (field: string) => (event: any) => {
        setForm({ ...form, [field]: event.target.value });
    };

    async function onLogin(email: string, password: string) {
        const user = await login_user(email, password);
        if (user){
            console.log(user)
            setUsername(user);
            props.goToMainMenu(user); // update user state in AuthFlow, intent to mainmenu
        }
    }
    

    return (
    <div className="auth-form">
        <h2 className="auth-subheader">
            Sign In
        </h2>
        <FormControl required={true} sx={{ width: '100%', marginBottom: 2}} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
            <OutlinedInput
            id="outlined-adornment-email"
            type='email'
            value={form.email}
            onChange={onChange('email')}
            label="Email"
            />
        </FormControl>
        <FormControl required={true} sx={{width: '100%', marginBottom: 3}} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={onChange('password')}
            endAdornment={
                <InputAdornment position="end">
                <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={e => e.preventDefault()}
                    edge="end"
                >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
                </InputAdornment>
            }
            label="Password"
            />
        </FormControl>
        <Button 
        variant="contained" 
        sx={{width: '100%', marginBottom: 6}}
        onClick={() => onLogin(form.email, form.password)}
        >
            Login
        </Button>
        <p className="auth-text text-link">Forgot your password?</p>
        <hr className="line-sep"/>
        <p className="auth-text">Don't have an account? 
            <span className="text-link" onClick={() => props.goToRegister()}> Sign up!</span>
        </p>
    </div>
    )
}
