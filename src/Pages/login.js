// login / sign up page 
import {Supabase} from '../../supabaseClient'; 
import Colors from '../Constants/Colors';
import {React, useEffect, useState, formEvent, changeEvent} from 'react';

export default function loginPage(){
    const [isSignUp, setIsSignUp] = useState(false); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

   const handleSubmit = async (email, event) => {
        event.preventDefault();
        if (isSignUp) {
            // Sign up logic
            const { user, error } = await Supabase.auth.signUp({ email, password });
            if (error) {
                console.error("Error signing up:", error);
            } else {
                console.log("User signed up:", user);
            }
        } else {
            // Login logic
            const { user, error } = await Supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error("Error logging in:", error);
            } else {
                console.log("User logged in:", user);
            }
        }
    };
    const styles = {
        button: {
            backgroundColor: Colors.menubarPink,
            color: 'white',
        }
    };
    
    return (
        <div>
            <h1>{isSignUp ? "Sign Up" : "Login"}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
            </form>
            <p>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Login" : "Sign Up"}
                </button>
            </p>
        </div>
    );
}
