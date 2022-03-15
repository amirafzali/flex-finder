import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { Container, Row } from "react-bootstrap";
import Table from 'react-bootstrap/Table'
import { useNavigate, useLocation } from "react-router-dom";
import { firebaseAuth } from "../firebase/firebase";
import { get_profile_data } from "../profile/profile_functions";

import ProfileModal from "../profile/ProfileModal";

import { SCHOOLS, GYMS } from "../recommendations/field_mappings";

export const Recommendations = () => {
    const location:{ [key: string]: any } = useLocation();
    const username = location.state;
    const navigate = useNavigate();

    // const [userRecs, setUserRecs] = useState<{[key: number]: Log}>([]);
    const [userRecs, setUserRecs] = useState<UserRow[]>([]);
    // const [userRecs, setUserRecs] = useState<Log | null>(null);
    const [selectedUsername, setSelectedUsername] = useState(username);
    const [showModal, setShowModal] = useState(false);

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
    interface UserRow {
        'username': String,
        'gyms': String[],
        'school': String
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
                      username: doc.id,
                      school: SCHOOLS[`${doc.get("School")}`],
                      gyms: doc.get("Gyms").map((x: any) => GYMS[x]),
                    });
                });                             
                setUserRecs(recommendations);   
            } else {
                console.error('profileData is null')
            }               
        })();        
    }, [])

    return (
      <>
        <ProfileModal
          show={showModal}
          setShow={setShowModal}
          username={selectedUsername}
        />
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
                  <th>Gyms</th>
                  <th>Appointment</th>
                </tr>
              </thead>
              <tbody>
                {userRecs.map((user: UserRow, i: number) => (
                  <tr key={i}>
                    <td style={{ textTransform: "capitalize" }}>
                      {user.username}
                    </td>
                    <td>{user.school}</td>
                    <td>{user.gyms.join(", ")}</td>
                    <td>
                      <Button
                        variant="outlined"
                        sx={{ width: "140px" }}
                        onMouseEnter={() => {
                          setSelectedUsername(user.username);
                        }}
                        onClick={() => {
                          setShowModal(true);
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
      </>
    );
}
