import CryptoJS from "crypto-js";

// Chave padrão para criptografia local (ofuscação).
// Em um cenário real, isso viria de uma variável de ambiente ou derivada de login do usuário.
const SECRET_KEY = process.env.REACT_APP_DATA_ENCRYPTION_KEY;

/**
 * Criptografa um objeto ou string para armazenamento seguro.
 * @param {any} data - Dados a serem criptografados.
 * @returns {string} String criptografada.
 */
export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error("Erro ao criptografar dados:", error);
    return null;
  }
};

/**
 * Descriptografa uma string criptografada.
 * Tenta detectar se é JSON legado (não criptografado) para migração suave.
 * @param {string} ciphertext - String criptografada ou JSON legado.
 * @returns {any} Dados descriptografados ou null em caso de erro fatal.
 */
export const decryptData = (ciphertext) => {
  try {
    if (!ciphertext) return null;

    // Tenta descriptografar
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    // Se decryptedString for vazia, pode ser que o conteúdo original não fosse criptografado
    // ou a chave esteja errada. Vamos tentar parsear como a string original se falhar.
    if (!decryptedString) {
      // Tentativa de Fallback para JSON legado (texto plano)
      try {
        return JSON.parse(ciphertext);
      } catch {
        return null;
      }
    }

    return JSON.parse(decryptedString);
  } catch (error) {
    // Se falhou a descriptografia AES (ex: formato inválido), tenta JSON puro
    try {
      return JSON.parse(ciphertext);
    } catch {
      console.error("Erro ao descriptografar/ler dados:", error);
      return null;
    }
  }
};

/**
 * Valida se uma URL é segura para sincronização (HTTPS).
 * Permite localhost para desenvolvimento.
 * @param {string} url
 * @returns {boolean}
 */
export const validateSyncUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
};
