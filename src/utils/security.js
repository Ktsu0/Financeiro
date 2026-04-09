import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.REACT_APP_DATA_ENCRYPTION_KEY || "financeiro_fallback_2024";

export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (err) {
    console.error("EncErr:", err);
    return null;
  }
};

export const decryptData = (ciphertext) => {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (decrypted) return JSON.parse(decrypted);
    
    // Fallback para JSON plano
    try { return JSON.parse(ciphertext); } catch { return null; }
  } catch (err) {
    try { return JSON.parse(ciphertext); } catch { return null; }
  }
};

export const validateSyncUrl = (url) => {
  if (!url) return false;
  try {
    const p = new URL(url);
    return p.protocol === "https:" || p.hostname === "localhost";
  } catch {
    return false;
  }
};
