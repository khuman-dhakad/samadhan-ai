import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "samadhan-ai-82e09.firebaseapp.com",
  projectId: "samadhan-ai-82e09",
  storageBucket: "samadhan-ai-82e09.firebasestorage.app",
  messagingSenderId: "302978996653",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export default app;