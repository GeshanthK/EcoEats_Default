// For Firebase JS SDK v9+
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import Constants from 'expo-constants';
import 'firebase/compat/firestore';

// Ensure your Firebase configuration in app.json is correct
const firebaseConfig = Constants.expoConfig.extra.firebase;

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore(); // Create a Firestore instance

export { firebase, db };
