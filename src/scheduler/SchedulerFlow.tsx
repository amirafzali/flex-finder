/**
 * File: SchedulerFlow.tsx
 * Date: January 1st, 2021
 * Details: CONTROLLER/FLOW FUNCTIONS: Controller to navigate between the different scheduling options(view, create, etc)
*/

import { useState} from "react";
import Button from "@mui/material/Button";
import {Container, Row, Col} from "react-bootstrap";
import {SchedulerView, SchedulerViewActive, SchedulerViewPending} from "./SchedulerView"
import {SchedulerCreate, SchedulerCreateSearchResults} from "./SchedulerCreate"
import { useNavigate, useLocation } from "react-router-dom";
import { firebaseAuth } from "../firebase/firebase";

enum SchedulerPages {
    HOME,
    VIEW,
    CREATE,
    ACTIVE,
    PENDING,
    CREATE_SEARCH_RESULTS,
}

// Main controller FLOW transitioning between different views
export function SchedulerFlow(){
    const navigate = useNavigate(); // intents between pages

    const [page, setPage] = useState(SchedulerPages.HOME);

    const goToHome = () => setPage(SchedulerPages.HOME);
    const goToView = () => setPage(SchedulerPages.VIEW);
    const goToCreate = () => setPage(SchedulerPages.CREATE);


    // check if session active(user logged in)
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
    <h1 id="auth-title">
        FlexFinder 💪
    </h1>

    {page === SchedulerPages.HOME && <SchedulerHome goToView={goToView} goToCreate={goToCreate}/>}
    {page === SchedulerPages.VIEW && <SchedulerViewFlow goToHome={goToHome}/>}
    {page === SchedulerPages.CREATE && <SchedulerCreateFlow goToHome={goToHome}/>}
    </Container>
    )
}

function SchedulerViewFlow(props: any){
    // Lets user switch between Viewing PENDING vs ACTIVE appointments FLOW

    const [page, setPage] = useState(SchedulerPages.VIEW);
    
    const goToActive = () => (setPage(SchedulerPages.ACTIVE));
    const goToPending = () => (setPage(SchedulerPages.PENDING));
    const goToView = () => (setPage(SchedulerPages.VIEW));

    
    return(
        <Container>
            {page === SchedulerPages.ACTIVE && <SchedulerViewActive goToView={goToView}/>}
            {page === SchedulerPages.PENDING && <SchedulerViewPending goToView={goToView}/>}
            {page === SchedulerPages.VIEW && <SchedulerView goToActive={goToActive} goToPending={goToPending} goToHome={props.goToHome}/>}
        
    </Container>
    )
}

function SchedulerCreateFlow(props: any){
    const [page, setPage] = useState(SchedulerPages.CREATE);
    const [searchResults, setSearchResults] = useState(new Set());

    const goToCreate = () => setPage(SchedulerPages.CREATE);
    const goToCreateSearchResults = (result:Set<string>) => {
        setSearchResults(result);
        setPage(SchedulerPages.CREATE_SEARCH_RESULTS);
    }

    return(
        <Container>
        {page === SchedulerPages.CREATE && <SchedulerCreate goToHome={props.goToHome} goToCreateSearchResults={goToCreateSearchResults}/>}
        {page === SchedulerPages.CREATE_SEARCH_RESULTS && <SchedulerCreateSearchResults goToCreate={goToCreate} searchResults={searchResults}/> /*New page displaying potential matches via searchResults */}
        </Container>
    )
}


function SchedulerHome(props: any){
    const location:{ [key: string]: any } = useLocation();
    const [username, setUsername]= useState(location.state);
    const navigate = useNavigate();

    return (
        <Container>
        <Row>
            <h2>Scheduler: Select an option below!</h2>
        </Row>
        <Row>
        <Col>
            <Button 
                variant="contained" 
                color="success"
                sx={{width: '70%', marginBottom: 3, marginLeft: 3}}
                onClick={() => {props.goToView()}}
                >
                    View Appointments
            </Button>
        </Col>
        <Col>
        <Button 
                variant="contained" 
                color="success"
                sx={{width: '70%', marginBottom: 2}}
                onClick={() => {props.goToCreate()}}
                >
                    Create Appointment
            </Button>
        </Col>
    </Row>
    <Row>
    <Button 
        variant="contained" 
        sx={{width: '70%', marginLeft: 5}}
        onClick={() => {navigate("/mainmenu", {state: username})}}
        >
            Go Back
    </Button>
    </Row>
    </Container>
    )
}