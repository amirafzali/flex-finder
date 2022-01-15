/**
 * File: App.js
 * Date: January 1st, 2021
 * Details: Contains the React Routes to navigate between pages
*/

import './App.css';
import { SearchFlow } from './search/SearchFlow';
import { SchedulerFlow } from "./scheduler/SchedulerFlow"
import { AuthScreen} from "./authenticate/AuthFlow"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./MainMenu/MainMenu"
import { FitnessTracker } from './tracker/FitnessTracker';
import ProfileView from './profile/ProfileView';
import Paper from '@mui/material/Paper';

function App() {
  const profileBox = (
    <Paper elevation={12} id="auth-box">
      <h1 id="auth-title">Profile Details</h1>
      <ProfileView></ProfileView>
    </Paper>
  );
  return (
      <div className="center-container">
        <Router>
          <Routes>
            <Route path={"/"} element={<AuthScreen />}></Route>
            <Route path={"/mainmenu"} element={<MainMenu />}></Route>
            <Route path={"/search"} element={<SearchFlow />}></Route>
            <Route path={"/scheduler"} element={<SchedulerFlow />}></Route>
            <Route path={"/tracker"} element={<FitnessTracker />}></Route>
            <Route path={"/profile"} element={profileBox}></Route>
            <Route
              path="*"
              element={
                <main style={{ padding: "1rem" }}>
                  <p>Error 404: Hmmm, looks like this is a blank page. 😔</p>
                </main>
              }
            />
          </Routes>
        </Router>           
      </div>
    );
}

export default App;
