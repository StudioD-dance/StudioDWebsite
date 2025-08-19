//contact us black bar at the bottom of every screen
import Colors from '../Constants/Colors';
import React, { useState, useEffect }  from 'react';
import {useNavigate, useLocation, Link } from 'react-router-dom';



export default function ContactUs() {
     const navigate = useNavigate();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getScrollTop = () =>
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const handle = () => {
      const scrolled = getScrollTop();
      const doc = document.documentElement;
      const pageTooShort = doc.scrollHeight <= window.innerHeight + 1;
      // show once you scroll a bit, OR if page is too short to scroll
      setVisible(scrolled > 120 || pageTooShort);
    };

    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("resize", handle);
    handle(); // run once on mount & on route change
    return () => {
      window.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);
    };
  }, [pathname]);

  // prevent the bar from covering bottom content when visible
  useEffect(() => {
    document.body.style.paddingBottom = visible ? "140px" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [visible]);

  const styles = {
    bottomRectangle: {
        position: "fixed",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-start",
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: "120px",
        backgroundColor: "Black",
        zIndex: 1000,
        flexWrap: "wrap",
    },
    body:{
        cursor: "pointer",
        fontSize: "14px",
        color: "white",
        textDecoration: "none",
    },
    header:{
        fontSize: "25px",
        color: "white",
        textAlign: "center",
    },
    section:{
        flex:1,
        textAlign: "center",
        maxWidth: "350px",
        overflow: "visible",
        wordWrap: "break-word",


    }
  };


  return (
    <div style ={styles.bottomRectangle}>
        <div style = {styles.section}>
            <h3 style={styles.header}>Studio D</h3>
            <p style={styles.body}>2525 Apalachee Parkway ste 8,<br></br>
                Tallahassee Fl, 32301
            </p>
            <p style={styles.body}>
                <Link to="/staff" style={styles.body}>
                   Staff Portal
                </Link>
            </p>
        </div>
        <div style = {styles.section}>
            <h3 style={styles.header}>
                Follow us on Social Media
            </h3>
            </div>
        <div style = {styles.section}>
            <h3 style ={styles.header}>
                Contact
            </h3>
            <p style={styles.body}>
            Subscribe to Email newsletter
            <br></br>
            Phone number : 850-224-0076
            <br></br>
            Email: studiodtally@gmail.com
            </p>
        </div>
        </div>
  );
}