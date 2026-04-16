const crypto = require("crypto");

const algorithm = "aes-256-cbc";
// Derive a 32-byte key from the JWT_SECRET
const secretKey = crypto
  .createHash("sha256")
  .update(String(process.env.JWT_SECRET))
  .digest("base64")
  .substring(0, 32);

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

const decrypt = (hash) => {
  try {
    const [ivHex, encryptedText] = hash.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed", error.message);
    return null;
  }
};

module.exports = {
  encrypt,
  decrypt,
};
