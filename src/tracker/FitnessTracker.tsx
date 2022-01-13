import { useEffect, useState } from "react";
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { useLocation } from "react-router-dom";
import { getDocs } from 'firebase/firestore';
import Fab from "@mui/material/Fab";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import AddIcon from '@mui/icons-material/Add';
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import './tracker.css'

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

enum WeightUnit {
    KG = "KG",
    LB = "LB"
}

enum TimeUnit {
    SECONDS = "SECONDS",
    MINUTES = "MINUTES",
    HOURS = "HOURS"
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
    eventDate: number,
    group: ExerciseGroup,
    exercise: string,
    weight?: Number,
    weightUnit?: WeightUnit,
    reps?: Number,
    sets?: Number,
    duration?: Number,
    timeUnit: TimeUnit
}

type Log = FitnessLog;

const makeFitnessLog = (
    group: ExerciseGroup,
    exercise: string,
    weight: Number,
    weightUnit: WeightUnit,
    reps: Number, 
    sets: Number,
    duration: Number,
    timeUnit: TimeUnit
): FitnessLog => {
    const date = new Date().getTime();
    return {
        creationDate: date,
        eventDate: date,
        group,
        exercise,
        weight,
        weightUnit,
        reps,
        sets,
        duration,
        timeUnit
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
    const [addOpen, setAddOpen] = useState(false);
  
    const handleClickOpen = () => {
        setAddOpen(true);
    };
  
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
            console.log('x')
        }
        fetchExisting();
    }, [username])

    const testAddRoutine = () => {
        const ex = makeFitnessLog(
            ExerciseGroup.BACK,
            "Dumbbell Row",
            30,
            WeightUnit.KG,
            8,
            4,
            0,
            TimeUnit.SECONDS
        )

        updateFitnessLog(ex, username)
        setFitnessLogs({...fitnessLogs, [ex.creationDate]: ex});
    }


    return (
        <div className="tracker-container">
            <h1 style={{textAlign: 'center'}}>Personal Fitness Tracker</h1> 
            <div className="logging-container">
                <FitnessGroups fitnessLogs={fitnessLogs} />
            </div>
            <div className="log-btn-row">
                <Fab
                    color="primary" 
                    aria-label="add"
                    onClick={() => testAddRoutine()}
                    className="new-log-button"
                >
                    <AddIcon />
                </Fab>
            </div>
        </div>
    )
}

interface RowProps {
    row: Log
}

interface FitnessGroupsProps {
    fitnessLogs: {[key: number]: Log}
}

export const FitnessGroups = (props: FitnessGroupsProps) => {
    const {fitnessLogs} = props;

    const uniqueGroups: {[key: string]: Log[]} = {};
    Object.values(fitnessLogs).forEach(e => {
        if(!(e.group in uniqueGroups)) uniqueGroups[e.group] = [];
        if(e.group in uniqueGroups) uniqueGroups[e.group].push(e);
    })

    return (
        <div>
            {Object.entries(uniqueGroups).map(bundle => {
                const [group, rows] = bundle;
                rows.sort((a,b) => b.eventDate-a.eventDate);

                const uniqueExercises: {[key: string]: Log[]} = {};
                rows.forEach(e => {
                    if(!(e.exercise in uniqueExercises)) uniqueExercises[e.exercise] = [];
                    if(e.exercise in uniqueExercises) uniqueExercises[e.exercise].push(e);
                })
                
                return (
                    <CollapsableSegment key={group} title={group} expand>
                        <div>
                            {Object.entries(uniqueExercises).map(bundle2 => {
                                    const [exercise, rows2] = bundle2;
                                    return (
                                        <CollapsableSegment key={exercise} title={exercise}>
                                            {rows2.map(e => (
                                                <FitnessRow row={e} key={e.creationDate}></FitnessRow>
                                            ))}
                                        </CollapsableSegment>
                                    )
                                })
                            }
                            
                        </div>
                    </CollapsableSegment>
                )
            })}
    </div>
    )
}

export const FitnessRow = (props: RowProps) => {
    const {row} = props;

    const formattedDate = new Date(row.eventDate).toLocaleDateString();
    const formattedDesc = `Weight: ${row.weight} ${row.weightUnit} |
                            ${row.sets} Sets x ${row.reps} Reps | Date: ${formattedDate}`;
    return (<div>
        <ListItem>
            <ListItemText primary={row.exercise} secondary={formattedDesc} />
        </ListItem>
        <Divider/>
    </div>);
}

export const CollapsableSegment = (props: any) => {
    return (
        <Accordion defaultExpanded={props.expand}>
            <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
            <Typography>{props.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {props.children}
            </AccordionDetails>
        </Accordion>
    )
}

export const NewLogPrompt = (props: any) => {
    const {open, handleClose} = props;  
    return (
      <div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Subscribe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To subscribe to this website, please enter your email address here. We
              will send updates occasionally.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleClose}>Subscribe</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }