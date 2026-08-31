import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

/**
 * Saves a new community issue report to Firestore.
 */
export const saveIssueReport = async (reportData) => {
  try {
    const timestamp = new Date().toISOString();
    const docRef = await addDoc(
      collection(db, "issueReports"),
      {
        ...reportData,
        status: reportData.status || "Reported",
        createdAt: reportData.createdAt || timestamp,
        updatedAt: timestamp,
      }
    );

    return docRef.id;
  } catch (error) {
    console.error("Firestore Save Error:", error);
    throw error;
  }
};

/**
 * Retrieves all issue reports from Firestore, ordered by creation date (newest first).
 */
export const getAllReports = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "issueReports")
    );

    const reports = [];

    querySnapshot.forEach((docSnap) => {
      reports.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    // In-memory sort by date descending to ensure deterministic ordering without requiring index configuration
    return reports.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Fetch Reports Error:", error);
    return [];
  }
};

/**
 * Retrieves issue reports for a specific user ID.
 * Uses in-memory sort to avoid requiring composite Firestore indexes.
 */
export const getUserReports = async (userId) => {
  if (!userId) return [];

  try {
    const reportsRef = collection(db, "issueReports");
    const q = query(reportsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const reports = [];

    querySnapshot.forEach((docSnap) => {
      reports.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    // In-memory sort by newest first
    return reports.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Fetch User Reports Error:", error);
    return [];
  }
};

/**
 * Updates the status of an issue report.
 */
export const updateReportStatus = async (reportId, newStatus) => {
  if (!reportId || !newStatus) {
    throw new Error("Report ID and new status are required");
  }

  try {
    const reportRef = doc(db, "issueReports", reportId);

    await updateDoc(reportRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    throw error;
  }
};

/**
 * Calculates issue report statistics across the entire database.
 */
export const getReportStatistics = async () => {
  try {
    const reports = await getAllReports();

    return {
      total: reports.length,
      reported: reports.filter(
        (report) => (report.status || "Reported") === "Reported"
      ).length,
      underReview: reports.filter(
        (report) => report.status === "Under Review"
      ).length,
      inProgress: reports.filter(
        (report) => report.status === "In Progress"
      ).length,
      resolved: reports.filter(
        (report) => report.status === "Resolved"
      ).length,
    };
  } catch (error) {
    console.error("Statistics Error:", error);
    return {
      total: 0,
      reported: 0,
      underReview: 0,
      inProgress: 0,
      resolved: 0,
    };
  }
};

/**
 * Deletes a report document from Firestore.
 */
export const deleteReport = async (reportId) => {
  if (!reportId) {
    throw new Error("Report ID is required for deletion");
  }

  try {
    const reportRef = doc(db, "issueReports", reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error("Delete Report Error:", error);
    throw error;
  }
};