
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    "projectId": "billzai",
    "appId": "1:743957871307:web:a6ed450e23c737a43ff94e",
    "storageBucket": "billzai.appspot.com",
    "apiKey": "AIzaSyDPFEoxyFrcJwWeQk6aVjK8YbPodmxLA2o",
    "authDomain": "billzai.firebaseapp.com",
    "measurementId": "G-YTWRN4GFLT",
    "messagingSenderId": "743957871307",
    "databaseURL": "https://billzai-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
