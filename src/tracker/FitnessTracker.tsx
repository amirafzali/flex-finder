import { useEffect, useState } from "react";
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, firebaseAuth } from "../firebase/firebase";
import { useLocation } from "react-router-dom";
import { getDocs } from 'firebase/firestore';
import Fab from "@mui/material/Fab";
import AddIcon from '@mui/icons-material/Add';

enum ExerciseGroup {
    CHEST = "Chest",
    BACK = "Back",
    SHOULDERS = "Shoulders",
    LEGS = "Legs",
    GLUTES = "Glutes",
    ABS = "Abs",
    BICEPS = "Biceps",
    TRICEPS = "Triceps",
    CARIDO = "Cardio"
}

const COMMON_EXERCISES =  {
    [ExerciseGroup.CHEST]: [
        "Flat Benchpress - Barbell", "Incline Benchpress - Barbell",
        "Flat Benchpress - Dumbbell", "Incline Benchpress - Dumbbell",
        "Flat Flies", "Incline Flies", "Cable Crossover", "Pushup"
    ],
    [ExerciseGroup.BACK]: [
        "Deadlift", "Cable Rows", "Cable Lat Pulldown", "Dumbbell Rows", "Pullup"
    ],
    [ExerciseGroup.SHOULDERS]: [
        "Shoulder Press - Dumbbell", "Shoulder Press - Barbell", "Shoulder Shrug",
        "Latteral Raises"
    ],
    [ExerciseGroup.BICEPS]: [
        "Cable Curb", "Regular Curl", "Preacher Curl", "Hammer Curl", "Isolation Curl"
    ],
    [ExerciseGroup.TRICEPS]: [
        "Cable Pulldown", "Skull Crusher", "Tricep Extension", "Close Grip Benchpress", "Dips"
    ],
    [ExerciseGroup.LEGS]: [
        "Squat", "Lunges", "Leg Press", "Hack Squat", "Calf Raises",
    ],
    [ExerciseGroup.ABS]: [
        "Plank", "Twist", "Leg Raise", "Crunch"
    ],
    [ExerciseGroup.CARIDO]: [
        "Treadmill", "Step Climber", "Cycling", "Swimming", "Hiking"
    ]
}

interface FitnessLog {
    creationDate: number,
    eventDate: Number,
    group: ExerciseGroup,
    exercise: string,
    weight?: Number,
    reps?: Number,
    sets?: Number,
    duration?: Number,
}

type Log = FitnessLog;

const makeFitnessLog = (
    group: ExerciseGroup,
    exercise: string,
    weight: Number,
    reps: Number, 
    sets: Number,
    duration: Number
): FitnessLog => {
    const date = new Date().getTime();
    return {
        creationDate: date,
        eventDate: date,
        group,
        exercise,
        weight,
        reps,
        sets,
        duration
    }
}

const updateFitnessLog = async (log: Log, username: string) => {
    const logDoc = doc(db, `/fitness/all/${username}/${log.creationDate}`)
    setDoc(logDoc, log)
}

export const TrackMenu = () => {
    return (<div>
        hello
    </div>);
}


export const FitnessTracker = () => {
    let [groupTime, setGroupTime] = useState(false);
    let [fitnessLogs, setFitnessLogs] = useState<{[key: number]: Log}>([]);
    const location: {[key: string]: any} = useLocation();
    const [username, setUsername] = useState<string>(location.state);

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
    })

    return (
        <div>
            <Fab color="primary" aria-label="add">
                <AddIcon />
            </Fab>
        </div>
    )
}

interface RowProps {
    row: Log
}

export const FitnessRow = (props: RowProps) => {
    const {row} = props;
    return (<div>
        {row.exercise}
    </div>);
}
