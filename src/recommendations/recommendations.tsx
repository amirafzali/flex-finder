import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { collection, deleteDoc, doc, query, getDocs, where, QuerySnapshot } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { Container, Row } from "react-bootstrap";
import Table from 'react-bootstrap/Table'
import { useNavigate, useLocation } from "react-router-dom";
import { firebaseAuth } from "../firebase/firebase";
import { getWorkoutTypes } from "../search/Search";
import { get_profile_data } from "../profile/profile_functions";



export const Recommendations = () => {
    const location:{ [key: string]: any } = useLocation();
    const username = location.state;
    const navigate = useNavigate();

    // const [userRecs, setUserRecs] = useState<{[key: number]: Log}>([]);
    const [userRecs, setUserRecs] = useState<UserRow[]>([]);
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
    interface UserRow {
        'username': String,
        'gyms': String,
        'school': String,
        'exercises': String[]
    }

    useEffect(() => {
        (async () => {
            const profileData = await get_profile_data(username);

            if (profileData !== null) {            
                let school = profileData.School;
                
                const profileCollection = collection(db,"Profile");
                const q = query(profileCollection, where("School", "==", school))
                const docs = await getDocs(q);                
                
                let recommendations: UserRow[] = [];
                
                docs.forEach(doc => {            
                    recommendations.push({
                        'username': doc.id,
                        'school': SCHOOLS[`${doc.get("School")}`],
                        'gyms': GYMS[`${doc.get("Gyms")}`],
                        'exercises': doc.get("Workout_types").map((workout: string) => EXERCISES[`${workout}`],)
                    });
                });                             
                setUserRecs(recommendations);   
            } else {
                console.error('profileData is null')
            }               
        })();        
    }, [])

    return (
      <Container>
        <Row>
            <h2 style={{ marginBottom: 10 }}>
              Recommendations from your school
            </h2>
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
                {userRecs.map((user: UserRow, i) => (
                <tr key={i}>
                    <td>{user.username}</td>
                    <td>{user.school}</td>
                    <td>{user.gyms}</td>
                    <td>{user.exercises.join(", ")}</td>
                  <td>
                    <Button
                      variant="outlined"
                      sx={{ width: "140px" }}
                      onClick={() => {
                        alert("Profile viewer not implemented");
                      }}
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
            sx={{ width: "100%", margin: "1rem auto 0", maxWidth: "200px" }}
            onClick={() => {
              navigate("/mainmenu", { state: username });
            }}
          >
            Go Back
          </Button>
        </Row>
      </Container>
    );
}
