/**
 * File: SearchFlow.tsx
 * Date: January 1st, 2021
 * Details: CONTROLLER/FLOW FUNCTIONS: Controller to manage Search results
*/

import { useEffect, useState } from "react";
import {FormControl, InputLabel, OutlinedInput, TextField, Select, MenuItem, Card, CardContent, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import {Container, Row, Col} from "react-bootstrap";
import { getGyms, getSchools, getWorkoutTypes, search_function } from "./Search";
import { useNavigate, useLocation } from "react-router-dom";
import { firebaseAuth } from "../firebase/firebase";
import SearchScreen from "./SearchView";
import { SearchResultsScreen } from "./SearchView";


enum SearchPage {
    SEARCH,
    RESULTS
}

// Main controller FLOW transitioning between different views
export function SearchFlow(){
    const navigate = useNavigate(); // intents between pages

    const [page, setPage] = useState(SearchPage.SEARCH);
    const [searchResult, setsearchResult] = useState(new Set());

    const goToSearch = () => setPage(SearchPage.SEARCH);
    const goToResults = (result:Set<string>) => {setsearchResult(result); setPage(SearchPage.RESULTS)};


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

    return (
    <Container>
    <h1 id="auth-title">
        FlexFinder 💪
    </h1>
    {page === SearchPage.SEARCH && <SearchScreen goToResults={goToResults}/>}
    {page === SearchPage.RESULTS && <SearchResultsScreen searchResult={searchResult} goToSearch={goToSearch}/>}
    </Container>
    )
}