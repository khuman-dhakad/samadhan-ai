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

import { db, isFirebaseConfigured } from "./firebaseConfig";

const VALID_STATUSES = ["Reported", "Under Review", "In Progress", "Resolved"];

/**
 * Saves a new community issue report to Firestore.
 * Strips PII (such as userEmail) from public documents and stores private metadata in a protected subcollection.
 */
export const saveIssueReport = async (reportData) => {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Please supply valid VITE_FIREBASE_* variables in your environment."
    );
  }

  if (!reportData) {
    throw new Error("Report data is required");
  }

  const lat = Number(reportData.latitude);
  const lng = Number(reportData.longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude value: ${reportData.latitude}. Must be between -90 and 90.`);
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude value: ${reportData.longitude}. Must be between -180 and 180.`);
  }

  if (!reportData.imageUrl || typeof reportData.imageUrl !== "string") {
    throw new Error("A valid image URL is required for issue submission");
  }

  const timestamp = new Date().toISOString();

  // Separate PII from public report payload
  const { userEmail, ...publicFields } = reportData;

  const sanitizedPublicReport = {
    category: (publicFields.category || "General Civic Issue").substring(0, 100),
    severity: publicFields.severity || "Medium",
    priority: publicFields.priority || "Medium",
    confidence:
      typeof publicFields.confidence === "number"
        ? Math.min(100, Math.max(0, Math.round(publicFields.confidence)))
        : 85,
    risk: (publicFields.risk || "Requires on-site municipal verification").substring(0, 500),
    department: (publicFields.department || "Municipal Corporation").substring(0, 100),
    imageUrl: publicFields.imageUrl.substring(0, 1000),
    imageName: (publicFields.imageName || "issue-image").substring(0, 255),
    latitude: lat,
    longitude: lng,
    locationName: (publicFields.locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`).substring(0, 500),
    userId: publicFields.userId || "anonymous",
    userName: (publicFields.userName || "Anonymous Citizen").substring(0, 100),
    status: "Reported",
    createdAt: publicFields.createdAt || timestamp,
    updatedAt: timestamp,
  };

  try {
    const docRef = await addDoc(collection(db, "issueReports"), sanitizedPublicReport);

    // If user provided an email and is authenticated, save private metadata in protected subcollection
    if (userEmail && sanitizedPublicReport.userId !== "anonymous") {
      try {
        await addDoc(collection(db, "issueReports", docRef.id, "private"), {
          userId: sanitizedPublicReport.userId,
          userEmail,
          createdAt: timestamp,
        });
      } catch (privateMetaError) {
        console.warn("Failed to store private user metadata:", privateMetaError?.message || privateMetaError);
      }
    }

    return docRef.id;
  } catch (error) {
    console.error("Firestore Save Error:", error);
    if (error?.code === "permission-denied") {
      throw new Error("Permission denied by Firestore security rules. Check report schema and authentication.", { cause: error });
    }
    throw error;
  }
};

/**
 * Retrieves all issue reports from Firestore, ordered by creation date (newest first).
 */
export const getAllReports = async () => {
  if (!isFirebaseConfigured) return [];

  try {
    const querySnapshot = await getDocs(collection(db, "issueReports"));
    const reports = [];

    querySnapshot.forEach((docSnap) => {
      reports.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

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
 */
export const getUserReports = async (userId) => {
  if (!isFirebaseConfigured || !userId) return [];

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
 * Updates the status of an issue report (restricted to verified admins in Firestore rules).
 */
export const updateReportStatus = async (reportId, newStatus) => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  if (!reportId || !newStatus) {
    throw new Error("Report ID and new status are required");
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}. Allowed: ${VALID_STATUSES.join(", ")}`);
  }

  try {
    const reportRef = doc(db, "issueReports", reportId);
    await updateDoc(reportRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    if (error?.code === "permission-denied") {
      throw new Error(
        "Permission denied. Only authorized administrators with verified Firebase custom claims can update report status.",
        { cause: error }
      );
    }
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
 * Deletes a report document from Firestore (restricted to verified admins in Firestore rules).
 */
export const deleteReport = async (reportId) => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  if (!reportId) {
    throw new Error("Report ID is required for deletion");
  }

  try {
    const reportRef = doc(db, "issueReports", reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error("Delete Report Error:", error);
    if (error?.code === "permission-denied") {
      throw new Error(
        "Permission denied. Only authorized administrators with verified Firebase custom claims can delete reports.",
        { cause: error }
      );
    }
    throw error;
  }
};