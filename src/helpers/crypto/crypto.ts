import { createHash, createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

const algorithm = 'aes-256-ctr';

const key = createHash("sha256")
  .update(String(process.env.ENCRYPT_KEY))
  .digest("base64")
  .substring(0, 32);
const iv = randomBytes(16);

class crypto {
  static encrypt(text: string) {
    const cipher = createCipheriv(algorithm, key, iv);

    const buffer = Buffer.concat([cipher.update(text), cipher.final()]);
  
    const hash = iv.toString("hex") + "**Moonbase**" + buffer.toString("hex");
    return Buffer.from(hash).toString("base64");
  }

  static decrypt(text: string) {
    const buffer = Buffer.from(text, "base64").toString("ascii");
    const hash = buffer.split("**Moonbase**");
  
    const string = {
      iv: hash[0],
      content: hash[1],
    };
  
    const decipher = createDecipheriv(
      algorithm,
      key,
      Buffer.from(string.iv, "hex")
    );
  
    const concat = Buffer.concat([
      decipher.update(Buffer.from(string.content, "hex")),
      decipher.final(),
    ]);
  
    return concat.toString();
  }

  static genUserInfo() {
    if (!process.env.ENCRYPT_KEY || typeof process.env.ENCRYPT_KEY !== 'string') return;

    const id = randomBytes(8).toString('hex');
    const token = createHmac('sha256', process.env.ENCRYPT_KEY)
      .update(id)
      .digest('hex');
    return { id, token };
  }

  static genKey() {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const key = Array.from({ length: 5 }, () => Array.from({ length: 4 }, () => characters[Math.floor(Math.random() * characters.length)])
      .join(""))
      .join("-");

    return key;
  }
}

export default crypto;