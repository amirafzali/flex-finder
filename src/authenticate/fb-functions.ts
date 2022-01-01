/**
 * File: fb-functions.ts
 * Date: January 1st, 2021
 * Details: LOGIC FUNCTIONS: to authenticate/register user to firebase
*/

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";

import { firebaseAuth } from "../firebase/firebase";
import { load_existing_user } from "../profile/profile_functions";

export async function create_user(email: string, password: string) {
    try {
        const status = await createUserWithEmailAndPassword(firebaseAuth, email, password)
        alert("User created!");
        return firebaseAuth!.currentUser!.uid;
    } catch {
        alert("User creation failed")
        return null;
    }
}

export async function login_user(email: string, password: string) {
    try {
        const username = await signInWithEmailAndPassword(firebaseAuth, email, password).then(async () =>
            {return await load_existing_user(firebaseAuth!.currentUser!.uid)}
        )

        alert("Sign in successful!");
        return username;
    } catch {
        alert("Sign in failed");
        return null;
    }
}