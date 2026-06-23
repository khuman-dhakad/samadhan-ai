import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const saveIssueReport = async (reportData) => {
  console.log("saveIssueReport called");
  console.log("DB Object:", db);

  try {
    const docRef = await addDoc(
      collection(db, "issueReports"),
      reportData
    );

    console.log("Report Saved:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("Firestore Error:", error);
    throw error;
  }
};