import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { get_profile_data } from "../profile/profile_functions";

import {
  GENDERS,
  EXERCISES,
  SCHOOLS,
  DAYS,
  HOURS,
} from "../recommendations/field_mappings";

export default function ProfileView(props: any) {
    const { show, setShow, username } = props;

    const [userData, setUserData] = useState<any>({})    

    const capitalize: any = {
      textTransform: "capitalize",
    };
    const largerFont: any = { 
        fontSize: "1.3rem"
    };

    useEffect(() => {
        get_profile_data(username)
        .then(profileData => {
            if (profileData != null){
                console.log(profileData);
                
                // there is a discrepancy between field names in the form versus what the firebase record returns... some fields are capitalized in the retrieved firebase records
                setUserData({
                    gender: profileData.Gender,
                    school: profileData.School,
                    workout_types: profileData.Workout_types,
                    timeslots_available: profileData.timeslots_available
                });
                console.log( profileData.Workout_types);
                console.log( profileData.timeslots_available);
                
            }
        });
    },[username]);

    

  return (
    <>
      {show && (
        <Modal
          show={show}
          onHide={() => setShow(false)}
          centered={true}
          animation={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <h1 style={capitalize}>{username}</h1>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>
              <strong>Gender:</strong> {GENDERS[userData?.gender]}
            </h3>
            <h3>
              <strong>School:</strong> {SCHOOLS[userData.school]}
            </h3>
            <h3>
              <strong>Exercises:</strong>
            </h3>
            <ul>
              {userData.workout_types.map((x: any, i: number) => (
                <li key={i} style={largerFont}>{EXERCISES[x]}</li>
              ))}
            </ul>
            <h3>
              <strong>Timeslots Available:</strong>
            </h3>
            <ul>
              {Object.entries(userData.timeslots_available).map((x: any, i: number) => (
                <li style={largerFont} key={i}>
                  {`${DAYS[x[1].day]} ${HOURS[x[1].start_time]} - ${HOURS[x[1].end_time]}`}
                </li>
              ))}
            </ul>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}

