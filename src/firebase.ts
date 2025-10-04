import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCe7EsWYPoAUUYVf7aEROwlvNIVMrAN5Fk",
  authDomain: "proposta-organizacao-salas.firebaseapp.com",
  databaseURL: "https://proposta-organizacao-salas-default-rtdb.firebaseio.com",
  projectId: "proposta-organizacao-salas",
  storageBucket: "proposta-organizacao-salas.firebasestorage.app",
  messagingSenderId: "171699069291",
  appId: "1:171699069291:web:b87fcd317a45043bd0ec2e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
