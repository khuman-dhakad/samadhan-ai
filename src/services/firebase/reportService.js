import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

export const saveIssueReport = async (reportData) => {
  console.log("saveIssueReport called");
  console.log("DB Object:", db);

  try {
const docRef = await addDoc(
  collection(db, "issueReports"),
  {
    ...reportData,
    status: "Reported",
  }
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

export const getUserReports = async (userId) => {
  try {
    const reportsRef = collection(
      db,
      "issueReports"
    );

    const q = query(
  reportsRef,
  where("userId", "==", userId),
  orderBy("createdAt", "desc")
);

    const querySnapshot = await getDocs(q);

    const reports = [];

    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return reports;
  } catch (error) {
    console.error(
      "Fetch User Reports Error:",
      error
    );

    return [];
  }
  
};
export const updateReportStatus = async (
  reportId,
  newStatus
) => {
  try {
    const reportRef = doc(
      db,
      "issueReports",
      reportId
    );

    await updateDoc(reportRef, {
      status: newStatus,
    });

    console.log(
      "Status Updated Successfully"
    );
  } catch (error) {
    console.error(
      "Update Status Error:",
      error
    );
    throw error;
  }
};