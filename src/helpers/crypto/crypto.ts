import { createHash, createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';
import helpers from '..';

const algorithm = 'aes-256-ctr';

class CryptoUtils {
  private static getKeyFromEnv(): string {
    const envEncryptKey = process.env.ENCRYPT_KEY;
    if (!envEncryptKey || typeof envEncryptKey !== 'string') {
      throw new Error('Invalid or missing ENCRYPT_KEY in environment variables.');
    }

    return createHash("sha256")
      .update(envEncryptKey)
      .digest("base64")
      .substring(0, 32);
  }

  static encrypt(text: string): string {
    const key = this.getKeyFromEnv();
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, key, iv);

    const buffer = Buffer.concat([cipher.update(text), cipher.final()]);
    const hash = iv.toString("hex") + `**${process.env.NAME}**` + buffer.toString("hex");

    return Buffer.from(hash).toString("base64");
  }

  static decrypt(text: string): string {
    const key = this.getKeyFromEnv();
    const buffer = Buffer.from(text, "base64").toString("ascii");
    const hash = buffer.split(`**${process.env.NAME}**`);

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
    const id = randomBytes(8).toString('hex');
    const encryptKey = this.getKeyFromEnv();
    const token = createHmac('sha256', encryptKey)
      .update(id)
      .digest('hex');
    return { id, token };
  }

  static genKey() {
    const seed = helpers.pkv.generateSeed();
    const key = helpers.pkv.generatePKV(seed);

    return key;
  }
}

export default CryptoUtils;