import './styling/App.css';
import React from 'react';
import {useNavigate, useLocation, BrowserRouter, Routes, Route } from 'react-router-dom';
import Menu from './Components/Menu';
import Colors from './Constants/Colors'; 
import ContactUs from './Components/contact';
import  Staff  from './Pages/staff.jsx'
import StaffHome from './Pages/staffHome.jsx'
import Home from "./Pages/Home.jsx";
import { supabase } from './supabaseClient'

function AppContent() {
  const location = useLocation();
  const hideMenuAndFooter = location.pathname === '/staffHome';

  return (
    <>
      {!hideMenuAndFooter && <Menu />}
      <Routes>
        {/* <Route path="/" element={<Home />} />    {/* Your home page */}
       <Route path="/staff" element={<Staff />} />
       <Route path="/staffHome" element={<StaffHome />} />
      </Routes>
      {!hideMenuAndFooter && <ContactUs />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
   
  );
}

export default App;
