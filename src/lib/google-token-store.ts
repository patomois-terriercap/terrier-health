import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { getDatabase } from "./firestore";

function encryptionKey() {
  const value = process.env.HEALTH_TOKEN_KEY;

  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error("HEALTH_TOKEN_KEY debe tener 64 caracteres hexadecimales");
  }

  return Buffer.from(value, "hex");
}

function connectionDocument() {
  return getDatabase().collection("private_connections").doc("google_health");
}

export async function saveRefreshToken(refreshToken: string) {
  if (!refreshToken) {
    throw new Error("Google no entregó un refresh token");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(refreshToken, "utf8"),
    cipher.final(),
  ]);

  await connectionDocument().set({
    version: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    encrypted: encrypted.toString("base64"),
    updatedAt: new Date(),
  });
}

export async function loadRefreshToken(): Promise<string | undefined> {
  const snapshot = await connectionDocument().get();

  if (!snapshot.exists) return undefined;

  const data = snapshot.data();

  if (
    data?.version !== 1 ||
    typeof data.iv !== "string" ||
    typeof data.tag !== "string" ||
    typeof data.encrypted !== "string"
  ) {
    throw new Error("La conexión guardada tiene un formato inválido");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(data.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(data.tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(data.encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}