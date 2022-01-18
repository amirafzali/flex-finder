import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocs } from 'firebase/firestore';
import './tracker.css'
import {Container} from "react-bootstrap";

import Fab from "@mui/material/Fab";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import AddIcon from '@mui/icons-material/Add';
import Edit from "@mui/icons-material/Edit";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { Autocomplete } from "@mui/material";
import { MenuItem } from "@mui/material";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

enum ExerciseGroup {
    CHEST = "Chest",
    BACK = "Back",
    SHOULDERS = "Shoulders",
    LEGS = "Legs",
    ABS = "Abs",
    BICEPS = "Biceps",
    TRICEPS = "Triceps",
    CARDIO = "Cardio"
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

const COMMON_EXERCISES: {[key: string]: string[]} =  {
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
    [ExerciseGroup.CARDIO]: [
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


export const TrackMenu = () => {
    return (<div>
        hello
    </div>);
}


export const FitnessTracker = () => {
    let [groupTime, setGroupTime] = useState(false);
    let [fitnessLogs, setFitnessLogs] = useState<{[key: number]: Log}>([]);
    const location: {[key: string]: any} = useLocation();
    const navigate = useNavigate();

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
        <Container className="tracker-container">
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
            <Button 
                variant="contained" 
                sx={{width: '100%', margin: '1rem auto 0', maxWidth: '200px'}}
                onClick={() => {navigate("/mainmenu", {state: username})}}
                >
                    Go Back
            </Button>
        </Container>
    )
}

interface RowProps {
    row: Log,
    updateEditLog: Function
}

interface FitnessGroupsProps {
    fitnessLogs: {[key: number]: Log},
    updateEditLog: Function
}

export const FitnessGroups = (props: FitnessGroupsProps) => {
    const {fitnessLogs, updateEditLog} = props;

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
                                                <FitnessRow 
                                                    row={e}
                                                    key={e.creationDate}
                                                    updateEditLog={updateEditLog}
                                                ></FitnessRow>
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
    const {row, updateEditLog} = props;

    const formattedDate = new Date(row.eventDate).toLocaleDateString();
    const formattedDesc = `Weight: ${row.weight} ${row.weightUnit} |
                            ${row.sets} Sets x ${row.reps} Reps | Date: ${formattedDate}`;
    return (<div>
        <ListItem
        secondaryAction={
            <IconButton onClick={() => updateEditLog(row)} edge="end" aria-label="delete">
              <Edit />
            </IconButton>
          }>
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

export const LogPrompt = (props: any) => {
    const {open, handleClose, existingLog, updateFitnessLog, deleteFitnessLog} = props;
    const [formFields, setFormFields] = useState<Log>({} as Log);
    console.log('x',existingLog)
    let title = "Add New Fitness Log";
    let updateButtonText = "Create";

    useEffect(() => {
        if(!open) {
            setTimeout(() => setFormFields({} as Log), 1000)
        } else {
            setFormFields({} as Log)
        }
        
    }, [open])
    
    if(!existingLog && !formFields.group) {
        const date = new Date().getTime();
        setFormFields({
            creationDate: date,
            eventDate: date,
            group: ExerciseGroup.CHEST,
            exercise: COMMON_EXERCISES[ExerciseGroup.CHEST][0],
            weight: 135,
            weightUnit: WeightUnit.LB,
            reps: 8,
            sets: 4,
            duration: 0,
            timeUnit: TimeUnit.MINUTES
        });
        console.log('t')
    } else if(existingLog && !formFields.group) {
        setFormFields(existingLog)
        console.log('y')
    }

    if(existingLog) {
        title = "Edit Fitness Log"
        updateButtonText = "Update";
    }

    const onChange = (v: any, key: string) => {
        setFormFields({...formFields, [key]: v})
        console.log(v)
    }

    const updateProcess = () => {
        console.log('t')
        updateFitnessLog(formFields);
        handleClose()
    }
    
    console.log(title)
    return (
        <div>
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
            <div className="input-row">
                <Autocomplete
                    disablePortal
                    options={Object.values(ExerciseGroup)}
                    sx={{ width: 300, marginRight: 4 }}
                    value={formFields.group}
                    renderInput={(params) => <TextField {...params} variant="standard" />}
                    onChange={(e,v) => {
                        console.log('x', v)
                        if(v) {
                            setFormFields({
                                ...formFields,
                                group: v,
                                exercise: COMMON_EXERCISES[v][0]
                            })
                        }
                        
                    }}
                />
                <Autocomplete
                    disablePortal
                    options={COMMON_EXERCISES[formFields.group as string]}
                    sx={{ width: 300 }}
                    value={formFields.exercise}
                    renderInput={(params) => <TextField {...params} variant="standard" />}
                    onChange={(e,v) => onChange(v,'exercise')}
                />
            </div>
            <br></br>
            <div className="input-row">
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center"}}>
                    <TextField
                        id="name"
                        type="number"
                        inputProps={{min: 0}}
                        fullWidth
                        variant="standard"
                        value={formFields.weight}
                        style={{width: "40%", marginRight: 10}}
                        onChange={(e) => onChange(e.target.value, 'weight')}
                        label="Weight"
                    />
                    <TextField
                        id="standard-select-currency"
                        select
                        value="KG"
                        onChange={(e) => onChange(e.target.value, 'weightUnit')}
                        variant="standard"
                        label="Unit"
                        >
                        {Object.values(WeightUnit).map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center"}}>
                <TextField
                    id="name"
                    type="number"
                    inputProps={{min: 0}}
                    fullWidth
                    variant="standard"
                    value={formFields.sets}
                    style={{width: "20%"}}
                    onChange={(e) => onChange(e.target.value, 'sets')}
                    label="Sets"
                />

                <TextField
                    id="name"
                    type="number"
                    inputProps={{min: 0}}
                    fullWidth
                    variant="standard"
                    value={formFields.reps}
                    style={{width: "20%", marginLeft: 10}}
                    onChange={(e) => onChange(e.target.value, 'reps')}
                    label="Reps"
                />
                </div>
            </div>
            <br></br>
            <div style={{marginTop: 10, display: 'flex', flexDirection: 'row', justifyContent: "center"}}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    value={new Date(formFields.eventDate)}
                    onChange={(newValue) => {
                        if(newValue)
                            onChange(newValue.getTime(), 'eventDate')
                    }}
                    renderInput={(params) => <TextField {...params} />}
                    label="Workout Date"
                />
            </LocalizationProvider>
            </div>
            </DialogContent>
            <DialogActions>
            {
                existingLog && <Button color="error" onClick={() => {handleClose(); deleteFitnessLog(existingLog)}}>Delete</Button>
            }
            <Button style={{color: 'gray'}} onClick={handleClose}>Cancel</Button>
            <Button color="primary" onClick={() => updateProcess()}>{updateButtonText}</Button>
            </DialogActions>
        </Dialog>
        </div>
    );
}
