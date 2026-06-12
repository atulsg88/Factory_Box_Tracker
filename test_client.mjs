import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB42eMqL3O7IFLZWydBmX-RA78o0y3IBpw",
    authDomain: "box-detection-75f81.firebaseapp.com",
    projectId: "box-detection-75f81",
    storageBucket: "box-detection-75f81.firebasestorage.app",
    messagingSenderId: "316007235728",
    appId: "1:316007235728:web:a20b1081aff646977a9815",
    measurementId: "G-8FYGS2Z2XD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFetch() {
    try {
        console.log("Connecting as client...");
        const snapshot = await getDocs(collection(db, "box_scans"));
        console.log(`Success! Fetched ${snapshot.docs.length} docs.`);
        process.exit(0);
    } catch (err) {
        console.error("Fetch failed stringified:", err.toString());
        process.exit(1);
    }
}

testFetch();
