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

function App() {
  return (
      <div className="center-container">
        <Router>
          <Routes>
            <Route path={"/"} element={<AuthScreen />}></Route>
            <Route path={"/mainmenu"} element={<MainMenu />}></Route>
            <Route path={"/search"} element={<SearchFlow />}></Route>
            <Route path={"/scheduler"} element={<SchedulerFlow />}></Route>
            <Route path={"/tracker"} element={<FitnessTracker />}></Route>
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
