import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { collection, deleteDoc, doc, query, getDocs, where, QuerySnapshot } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { Container, Row } from "react-bootstrap";
import Table from 'react-bootstrap/Table'
import { useNavigate, useLocation } from "react-router-dom";
import { firebaseAuth } from "../firebase/firebase";
import { getWorkoutTypes } from "../search/Search";



export const Recommendations = () => {
    const location:{ [key: string]: any } = useLocation();
    const navigate = useNavigate();
    const [username, setUsername]= useState<string>(location.state);

    // const [userRecs, setUserRecs] = useState<{[key: number]: Log}>([]);
    const [userRecs, setUserRecs] = useState<TableRow[]>([]);
    // const [userRecs, setUserRecs] = useState<Log | null>(null);

    // check if session active
    firebaseAuth.onAuthStateChanged((user:any) => {
        if (user){
            console.log("session active");
        }
        else{
        // session expired
        navigate("/");
        }
    })
    
    let SCHOOLS: { [key: string]: string } =  {
        mcmaster: "McMaster",
        uwaterloo: "University of Waterloo",
        uoft: "University of Toronto"
    }
    
    let GYMS: { [key: string]: string } = {
        'mcmaster_dbac': "McMaster DBAC",
        'uwaterloo_gym2': "UWaterloo Gym 2",
        'uoft_gym1': "U of T Gym 1",
        'uwaterloo_gym1': "UWaterloo Gym "
    }
    
    let EXERCISES: { [key: string]: string } = {
        back: "Back",
        biceps: "Biceps",
        cardio: "Cardio",
        chest: "Chest",
        core: "Core",
        shoulders: "Shoulders",
        triceps: "Triceps",
    }
    interface TableRow {
        'username': String,
        'gyms': String,
        'school': String,
        'exercises': String[]
    }

    useEffect(() => {
        (async () => {
            const profileCollection = collection(db,"Profile");
            const q = query(profileCollection, where("School", "==", "mcmaster"))
            const docs = await getDocs(q);                
            
            let reccomendations: TableRow[] = [];
            docs.forEach(doc => {            
                reccomendations.push({
                    'username': doc.id,
                    'school': SCHOOLS[`${doc.get("School")}`],
                    'gyms': GYMS[`${doc.get("Gyms")}`],
                    'exercises': doc.get("Workout_types").map((workout: string) => EXERCISES[`${workout}`],)
                });
            });            
            console.log(reccomendations);                  
            setUserRecs(reccomendations);                  
        })();        
    }, [])

    return (
        <Container>
            <Row>
                <h2 style={{marginBottom: 10}}>Recomendations</h2>
                <Table responsive bordered>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>School</th>
                            <th>Gym</th>
                            <th>Exercises</th>
                            <th>Appointment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userRecs.map((doc: TableRow) => (
                            <tr>
                                <td>{doc.username}</td>
                                <td>{doc.school}</td>
                                <td>{doc.gyms}</td>
                                <td>{doc.exercises.join(', ')}</td>
                                <td>
                                    <Button
                                        variant="outlined"
                                        sx={{width: '140px'}}
                                        onClick={() => {alert('Profile viewer not implemented')}}
                                    >
                                        View Profile
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Row>
            <Row>
                <Button 
                    variant="contained" 
                    sx={{width: '100%', margin: '1rem auto 0', maxWidth: '200px'}}
                    onClick={() => {navigate("/mainmenu", {state: username})}}
                    >
                        Go Back
                </Button>
            </Row>
        </Container>
    )
}
