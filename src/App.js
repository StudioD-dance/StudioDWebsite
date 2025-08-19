import './styling/App.css';
import React from 'react';
import {useNavigate, useLocation, BrowserRouter, Routes, Route } from 'react-router-dom';
import Menu from './Components/Menu';
import Colors from './Constants/Colors'; 
import ContactUs from './Components/contact';
import Staff from "./Pages/staff";
import Home from "./Pages/Home";
  

function App() {
  return (
    <BrowserRouter>
      <Menu />
      <Routes>
        {/* <Route path="/" element={<Home />} />    {/* Your home page */}
       <Route path="/staff" element={<Staff />} />
      </Routes>
      <ContactUs />
    </BrowserRouter>
   
  );
}


export default App;
