/**
 * Samadhan AI - Admin Custom Claim Provisioning Utility
 *
 * Purpose:
 *   Assigns the `admin: true` custom claim to a Firebase Authentication user.
 *   This custom claim is required by Firestore Security Rules to perform administrative
 *   mutations (updating report status, deleting reports).
 *
 * Prerequisites:
 *   1. Download your Firebase service account JSON from:
 *      Firebase Console -> Project Settings -> Service accounts -> Generate new private key
 *   2. Set environment variable:
 *      export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
 *      (or on Windows PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json")
 *
 * Usage:
 *   node scripts/set-admin-claim.mjs <user-uid-or-email>
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

async function main() {
  const targetUserIdentifier = process.argv[2];

  if (!targetUserIdentifier) {
    console.error("❌ Error: Missing user identifier (UID or email).");
    console.log("Usage: node scripts/set-admin-claim.mjs <user-uid-or-email>");
    process.exit(1);
  }

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath || !fs.existsSync(keyPath)) {
    console.error("❌ Error: GOOGLE_APPLICATION_CREDENTIALS is not set or points to an invalid path.");
    console.log("Set GOOGLE_APPLICATION_CREDENTIALS to your serviceAccountKey.json path.");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  const auth = getAuth();

  let targetUid = targetUserIdentifier;

  // If argument is an email address, lookup UID first
  if (targetUserIdentifier.includes("@")) {
    try {
      const userRecord = await auth.getUserByEmail(targetUserIdentifier);
      targetUid = userRecord.uid;
      console.log(`✅ Located user by email: ${targetUserIdentifier} (UID: ${targetUid})`);
    } catch (err) {
      console.error(`❌ User not found with email: ${targetUserIdentifier}`, err.message);
      process.exit(1);
    }
  }

  try {
    await auth.setCustomUserClaims(targetUid, { admin: true });
    console.log(`🎉 Successfully assigned { admin: true } custom claim to user: ${targetUid}`);
    console.log("Note: The user must sign out and sign back in (or force token refresh) to update their ID token.");
  } catch (err) {
    console.error("❌ Failed to set custom user claims:", err);
    process.exit(1);
  }
}

main();
