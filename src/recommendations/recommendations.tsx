import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, query, getDocs, where } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { get_profile_data } from "../profile/profile_functions"

export const Recommendations = () => {
    const location: {[key: string]: any} = useLocation();
    const [username, setUsername] = useState<string>(location.state);
    const navigate = useNavigate(); // intents between pages

    useEffect(() => {
        async function fetchExisting() {
            const profileCollection = collection(db,"Profile");
            const q = query(profileCollection, where("School", "==", "mcmaster"))
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            });
                  
        }
        fetchExisting();
    }, [username])

    return (
        <div>
            <table id='rTable'>
                <thead>
                    <tr>
                        <th>
                            Name
                        </th>
                        <th>
                            Gym
                        </th>
                        <th>
                            Exercise Types
                        </th>
                        <th>
                            Appointment
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            usernames[0]
                        </td>
                            <td>
                            gyms[0]
                        </td><td>
                            Cardio
                        </td><td>
                            appointment button here
                        </td>
                    </tr> 
                </tbody>
            </table>
        </div>
    )






}




/*
export const FitnessTracker = () => {
    let [groupTime, setGroupTime] = useState(false);
    let [fitnessLogs, setFitnessLogs] = useState<{[key: number]: Log}>([]);
    const location: {[key: string]: any} = useLocation();
    const [username, setUsername] = useState<string>(location.state);
    const [addOpen, setAddOpen] = useState(false);
    const [editLog, setEditLog] = useState<Log | null>(null);
  
    const handleClose = () => {
        setAddOpen(false);
    };

    useEffect(() => {
        async function fetchExisting() {
            const allLogs = collection(db, `/fitness/all/${username}`)
            const docs = await getDocs(allLogs);
            const docData = docs.docs.map(e => e.data() as FitnessLog);
            const fitnessMap: {[key: number]: Log} = {}
            docData.forEach(e => fitnessMap[e.creationDate] = e)
            setFitnessLogs(fitnessMap)
        }
        fetchExisting();
    }, [username])

    const updateFitnessLog = async (log: Log) => {
        const logDoc = doc(db, `/fitness/all/${username}/${log.creationDate}`)
        await setDoc(logDoc, log)
        setFitnessLogs({...fitnessLogs, [log.creationDate]: log})
    }

    const deleteFitnessLog = async (log: Log) => {
        const logDoc = doc(db, `/fitness/all/${username}/${log.creationDate}`)
        await deleteDoc(logDoc);
        let logsCopy = Object.assign({}, fitnessLogs)
        delete logsCopy[log.creationDate]
        setFitnessLogs(logsCopy)
    }

    const updateEditLog = (log: Log | null) => {
        setEditLog(log);
        setAddOpen(true);
    }

    return (
        <div className="tracker-container">
            <LogPrompt 
                handleClose={handleClose}
                open={addOpen}
                updateFitnessLog={updateFitnessLog}
                deleteFitnessLog={deleteFitnessLog}
                existingLog={editLog}
            />
            <h1 style={{textAlign: 'center'}}>Personal Fitness Tracker</h1> 
            <div className="logging-container">
                <FitnessGroups
                    fitnessLogs={fitnessLogs}
                    updateEditLog={updateEditLog} 
                />
            </div>
            <div className="log-btn-row">
                <Fab
                    color="primary" 
                    aria-label="add"
                    onClick={() => {setEditLog(null); setAddOpen(true)}}
                    className="new-log-button"
                >
                    <AddIcon />
                </Fab>
            </div>
        </div>
    )
}
*/