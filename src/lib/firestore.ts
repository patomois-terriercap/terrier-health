import "server-only";
import { Firestore } from "@google-cloud/firestore";

let database: Firestore | undefined;

export function getDatabase() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;

  if (!projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT no está configurado");
  }

  database ??= new Firestore({ projectId });
  return database;
}