/**
 * File: SchedulerView.tsx
 * Date: January 1st, 2021
 * Details: VIEW FUNCTIONS: Scheduler view to View active/pending appointments & take actions on them(accept/decline)
*/

import { useState, useEffect } from "react";
import { Card, CardActions, CardContent,Typography} from "@mui/material";
import Button from "@mui/material/Button";
import {Container, Row, Col} from "react-bootstrap";
import { get_requests, respond_requests, delete_appointment } from "./scheduler_functions";
import { useLocation } from "react-router-dom";

enum SchedulerPages {
    HOME,
    VIEW,
    CREATE,
    ACTIVE,
    PENDING,
    CREATE_SEARCH_RESULTS,
}


export function SchedulerView (props: any){
    // ACTUAL UI for PENDING vs ACTIVE appointments FLOW
    return (
    <Container>
        <h2 >Active or Pending?</h2>
    <Row>
        <Col>
            <Button 
                variant="contained" 
                color="success"
                sx={{width: '70%', marginBottom: 3, marginLeft: 8}}
                onClick={() => {props.goToActive()}}
                >
                    active
            </Button>
        </Col>
        <Col>
            <Button 
                variant="contained" 
                color="success"
                sx={{width: '70%', marginBottom: 2, marginLeft: 5}}
                onClick={() => {props.goToPending()}}
                >
                    pending
            </Button>
        </Col>
    </Row>
    <Row>
    <Button 
        variant="contained" 
        sx={{width: '70%', marginLeft: 5}}
        onClick={() => {console.log("BACK pressed"); props.goToHome()}}
        >
            Go Back
    </Button>
    </Row>
    </Container>
    )
}

export function SchedulerViewActive(props: any){
    // DISPLAYS ACTIVE APPOINTMENTS
    const location:{ [key: string]: any } = useLocation();
    const [username, setUsername] = useState<string>(location.state);
    
    const [active, setActive] = useState<{ [key: string]: any }|null>(null);

    const onChangeActive = () => {get_requests(username,"active").then((response) => setActive(response))};
    
    // update Active initially
    useEffect(() => {
        onChangeActive();
      }, []);
    
    
    return(
    <Container>
        <h2>ACTIVE APPOINTMENTS</h2>
    <Row>
        <Button 
        variant="contained" 
        sx={{width: '70%', marginLeft: 3}}
        onClick={() => {console.log("BACK pressed from active appointments"); props.goToView()}}
        >
            Go Back
        </Button>
    </Row>

    {
        active != null && active != undefined && Object.keys(active).map((appointment_id:string, index:Number) => {
            let data = active[appointment_id];
            console.log(data['gym']);
            return (
        <Row  key={appointment_id}>
        <Card sx={{ minWidth: 280, marginTop: 3}}>
        <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Appointment_id:{appointment_id}
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Time: {data['timeslot']['day'] + ", start_hour:" + data['timeslot']['start_time'] + ", end_hour:" + data['timeslot']['end_time']}
            </Typography>
            <Typography sx={{ mb: 0.2 }} color="text.secondary">
            Partner: {data['partner']}
            </Typography>
            <Typography color="text.secondary">
            Gym: {data['gym']}
            </Typography>
            <Typography color="text.secondary">
            Exercise_type: {data['type']}
            </Typography>
        </CardContent>
        <CardActions>
            <Row>
            <Col>
            <Button 
                size="small"
                sx={{width: '70%', marginBottom: 1, marginLeft: 11}}
                variant="contained" 
                color="error"
                onClick={() => {console.log("DECLINE CLICKED" ,appointment_id); delete_appointment(username, appointment_id).then(() =>{onChangeActive();})}}>Decline</Button>
            </Col>
            </Row>
        </CardActions>
        </Card>
        </Row>
            );
        })
    }
    
        </Container>
    )
}

export function SchedulerViewPending(props: any){
    // DISPLAYS PENDING APPOINTMENTS
    const location:{ [key: string]: any } = useLocation();
    const [username, setUsername] = useState<string>(location.state);
    
    const [pending, setPending] = useState(null);

    const onChangePending = () => {get_requests(username,"pending").then((response) => setPending(response))};
    
    // update pending initially
    useEffect(() => {
        onChangePending();
      }, []);
    
    
      return(
        <Container>
            <h2>PENDING APPOINTMENTS</h2>
        <Row>
            <Button 
            variant="contained" 
            sx={{width: '70%', marginLeft: 3}}
            onClick={() => {console.log("BACK pressed from pending appointments"); props.goToView()}}
            >
                Go Back
            </Button>
        </Row>
        {
            pending != null && pending != undefined && Object.keys(pending).map((appointment_id:string, index:Number) => {
                let data = pending[appointment_id];
                const is_sender = data['is_sender'];

                return (
            <Row  key={appointment_id}>
            <Card sx={{ minWidth: 280, marginTop: 3 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Appointment_id:{appointment_id}
                </Typography>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Time: {data['timeslot']['day'] + ", start_hour:" + data['timeslot']['start_time'] + ", end_hour:" + data['timeslot']['end_time']}
                </Typography>
                <Typography sx={{ mb: 0.2 }} color="text.secondary">
                Partner: {data['partner']}
                </Typography>
                <Typography color="text.secondary">
                Gym: {data['gym']}
                </Typography>
                <Typography color="text.secondary">
                Exercise_type: {data['type']}
                </Typography>
            </CardContent>
            <CardActions>
                <Row>
                {(is_sender==false) && // only display accept button for recipient - only recipient accepts
                <Col>  
                <Button 
                    size="small"
                    sx={{width: '70%', marginBottom: 1, marginLeft: 4}}
                    variant="contained" 
                    color="success"
                    onClick={() => {console.log("ACCEPT CLICKED" ,appointment_id); respond_requests(username, appointment_id, "accept").then(() => onChangePending())}}>Accept</Button>
                </Col>
                }
                <Col>
                <Button 
                    size="small"
                    sx={{width: '70%', marginBottom: 1, marginLeft: 4}}
                    variant="contained" 
                    color="error"
                    onClick={() => {console.log("DECLINE CLICKED" ,appointment_id); respond_requests(username, appointment_id, "decline").then(() => onChangePending())}}>Decline</Button>
                </Col>
                </Row>
            </CardActions>
            </Card>
            </Row>
                );
            })
        }
        
            </Container>
        )
}