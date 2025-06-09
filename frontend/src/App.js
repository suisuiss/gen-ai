import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInSide from "./SigninSide";
import SignUpSide from "./SignUpSide";
import Homepage from './Homepage';
import Floorplan from './floorplan';

import RoomDetails from './RoomDetails.js';

<Route path="/room-details" element={<RoomDetails />} />


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<SignInSide />} />
                    <Route path="/signup" element={<SignUpSide />} />
                    <Route path="/homepage" element={<Homepage />} />
                    <Route path="/floor-plan" element={<Floorplan />} />
                    <Route path="/room-details" element={<RoomDetails />} />
                    <Route path="*" element={<h2>Page Not Found</h2>} />
                </Routes>

            </div>
        </Router>
    );
}

export default App; 