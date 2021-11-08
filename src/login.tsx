import { useState } from "react";
import Paper from '@mui/material/Paper';
import { FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, TextField} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Button from "@mui/material/Button";
import { login_user, create_user } from "./fb-functions";

enum AuthPage {
    LOGIN,
    REGISTER
}

async function onLogin(email: string, password: string) {
    login_user(email, password)
}

async function onRegister(email: string, password: string) {
    create_user(email, password)
}

export function AuthScreen() {
    const [page, setPage] = useState(AuthPage.LOGIN);

    const goToLogin = () => setPage(AuthPage.LOGIN);
    const goToRegister = () => setPage(AuthPage.REGISTER);
    
    return <Paper elevation={12} id="auth-box">
        <h1 id="auth-title">
            FlexFinder 💪
        </h1>
        {page === AuthPage.LOGIN && <Login goToRegister={goToRegister}/>}
        {page === AuthPage.REGISTER && <Register goToLogin={goToLogin}/>}
    </Paper>
}

function Login(props: any) {
    console.log(props)
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const onChange = (field: string) => (event: any) => {
        setForm({ ...form, [field]: event.target.value });
    };

    return (
    <div className="auth-form">
        <h2 className="auth-subheader">
            Sign In
        </h2>
        <FormControl sx={{ width: '100%', marginBottom: 2}} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
            <OutlinedInput
            id="outlined-adornment-email"
            type='email'
            value={form.email}
            onChange={onChange('email')}
            label="Email"
            />
        </FormControl>
        <FormControl sx={{width: '100%', marginBottom: 3}} variant="outlined">
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

function Register(props: any) {
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