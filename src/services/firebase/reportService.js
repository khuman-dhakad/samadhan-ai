import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

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

export const getAllReports = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "issueReports")
    );

    const reports = [];

    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return reports;
  } catch (error) {
    console.error("Fetch Reports Error:", error);
    return [];
  }
};