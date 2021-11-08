import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";

import { firebaseAuth } from "./firebase";

export async function create_user(email: string, password: string) {
    try {
        await createUserWithEmailAndPassword(firebaseAuth, email, password)
        alert("User created!");
    } catch {
        alert("User creation failed")
    }
}

export async function login_user(email: string, password: string) {
    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password)
        alert("Sign in successful!");
    } catch {
        alert("Sign in failed");
    }
}