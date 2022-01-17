/**
 * File: MainMenu.tsx
 * Date: January 1st, 2021
 * Details: FLOW/CONTROLLER FUNCTIONS: Controller Flow to intent between different functionality
*/

import { useState } from "react";
import Button from "@mui/material/Button";
import {Container, Row, Col} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { firebaseAuth } from "../firebase/firebase";
import { signOut } from "firebase/auth";

export default function MainMenu(props:any){
    const location:{ [key: string]: any } = useLocation();
    const [username, setUsername]= useState(location.state);
    const navigate = useNavigate();

    // Redirect to login screen if user not logged in
    firebaseAuth.onAuthStateChanged((user:any) => {
        if (user){
            console.log("session active");
        }
        else{
        // session expired
        navigate("/");
        }
    })
    
    return (
        <Container>
            <Row>
                <Col>
                <div className="center">
                    <h1 id="auth-title">
                    FlexFinder 💪
                    </h1>
                </div>
                </Col>
            </Row>
            <Row>
                <Col>
                <h2 className="auth-subheader">
                Welcome back, {username}!
                </h2>
                </Col>
                <Col>
                <Button 
                    variant="contained"
                    color="error"
                    sx={{width: '100%', marginLeft: 12, marginRight: 1, marginBottom: 3}}
                    onClick={() => {signOut(firebaseAuth).then(() => {
                        // Sign-out successful.
                        alert("Sign out successful!");
                        navigate("/");

                      }).catch((error) => {
                        // An error happened.
                        alert(error)
                      });}}
                    >
                        Log out
                </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                <Button 
                    variant="contained"
                    sx={{width: '100%', marginLeft: 1, marginBottom: 3}}
                    onClick={() => navigate("/scheduler", {state: username})}
                    >
                        Scheduler
                </Button>
                </Col>
                <Col>
                <Button 
                    variant="contained"
                    sx={{width: '100%', marginLeft: 1, marginBottom: 3}}
                    onClick={() => navigate("/search", {state: username})}
                    >
                        Search
                </Button>
                </Col>
                <Col>
                <Button 
                    variant="contained"
                    sx={{width: '100%', marginLeft: 1, marginBottom: 3}}
                    onClick={() => navigate("/profile", {state: username})}
                    >
                        MyProfile
                </Button>
                </Col>
                <Col>
                <Button 
                    variant="contained"
                    sx={{width: '100%', marginLeft: 1, marginBottom: 3}}
                    onClick={() => navigate("/tracker", {state: username})}
                    >
                        MyFitnessTrack
                </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                      
                      <Button
                        variant="contained"
                        sx={{width: '100%', marginLeft:1, marginBottom: 3}}
                        onClick={() => navigate("/recommendations", {state:username})}
                      >
                          Recommendations
                      </Button>

                </Col>
            </Row>
        </Container>
    )
}