import Colors from '../Constants/Colors';
import React from 'react';
import {useNavigate, useLocation, Link } from 'react-router-dom';


export default function Menu() {
     const navigate = useNavigate();
  const { pathname } = useLocation();

  const menuItems = [
    { label: "Home",  route: "Home" },
    { label: "About Us", route: "About" },
    { label: "Schedule",  route: "Schedule" },
    { label: "Cycle", route: "cycle" },
    { label: "Apparel", route: "apparel"},
    {label: "Events", route: "events" },
    {label: "Teams", route: "teams" },
  ];
  const styles = {
    topRectangle: {
        position: "fixed",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        top: 0,
        left: 0,
        right: 0,
        height: "120px",
        backgroundColor: Colors.menubarPink,
        zIndex: 1000,
    },
    menuItems:{
        cursor: "pointer",
        fontSize: "25px",
        color: "black",
        textDecoration: "none",
        padding: "10px 20px",
        borderRadius: "5px",
    },
  };
  return (
    <div style ={styles.topRectangle}>
        {menuItems.map((item) => {
            const path = `/${item.route}`;
            const isActive = pathname === path;
            return (
                <div
                    key={item.label}
                    style={{
                        ...styles.menuItems,
                        fontWeight: isActive ? 'bold' : 'normal',
                        opacity: isActive ? 1 : 0.7,
                    }}
                    onClick={() => {if (!isActive) navigate(path);}
                    }
                    >
                        {item.label}
                    </div>
            );
        })}
    </div>
      
  );
}