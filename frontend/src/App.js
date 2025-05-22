import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInSide from "./SigninSide";
import Header from "./Header";
import SignUpSide from "./SignUpSide";



function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<SignInSide />} />
                <Route path="/signup" element={<SignUpSide />} />
                <Route path="*" element={<h2>Page Not Found</h2>} />
            </Routes>
        </Router>
    );
}

export default App;
