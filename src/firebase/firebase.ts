/**
 * File: firebase.ts
 * Date: January 1st, 2021
 * Details: LOGIC FUNCTIONS: Firebase Initialization, Firestore Object and FireBase Auth exports
*/

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth } from "@firebase/auth";
import {getFirestore} from '@firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  databaseURL: process.env.REACT_APP_databaseURL,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
};

// Initialize Firebase

const app: FirebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth();
export const db = getFirestore();