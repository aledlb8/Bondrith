import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto';
import helpers from '..';
import { Cipher, Decipher } from "node:crypto";

const algorithm = "aes-256-ctr";

/**
 * CryptoUtils provides encryption, decryption and key generation utilities.
 *
 * The encrypt and decrypt methods use AES-256-CTR to encrypt and decrypt strings.
 * Keys are derived from the ENCRYPT_KEY environment variable.
 *
 * The genUserInfo method generates a random user ID and token.
 *
 * The genKey method generates a cryptographic key using a seed and PKV helper.
 */
class CryptoUtils {
  private static getKeyFromEnv(): string {
    const envEncryptKey: string = process.env.ENCRYPT_KEY;
    if (!envEncryptKey) {
      throw new Error(
        "Invalid or missing ENCRYPT_KEY in environment variables."
      );
    }

    return createHash("sha256")
      .update(envEncryptKey)
      .digest("base64")
      .substring(0, 32);
  }

  static encrypt(text: string): string {
    const key: string = this.getKeyFromEnv();
    const iv: Buffer = randomBytes(16);
    const cipher: Cipher = createCipheriv(algorithm, key, iv);

    const buffer: Buffer = Buffer.concat([cipher.update(text), cipher.final()]);
    const hash: string =
      iv.toString("hex") + `**${process.env.NAME}**` + buffer.toString("hex");

    return Buffer.from(hash).toString("base64");
  }

  static decrypt(text: string): string {
    const key: string = this.getKeyFromEnv();
    const buffer: string = Buffer.from(text, "base64").toString("ascii");
    const hash: string[] = buffer.split(`**${process.env.NAME}**`);

    const string = {
      iv: hash[0],
      content: hash[1],
    };

    const decipher: Decipher = createDecipheriv(
      algorithm,
      key,
      // @ts-ignore
      Buffer.from(string.iv, "hex")
    );

    const concat: Buffer = Buffer.concat([
      // @ts-ignore
      decipher.update(Buffer.from(string.content, "hex")),
      decipher.final(),
    ]);

    return concat.toString();
  }

  static genUserInfo() {
    const id: string = randomBytes(8).toString("hex");
    const encryptKey: string = this.getKeyFromEnv();
    const token: string = createHmac("sha256", encryptKey).update(id).digest("hex");
    return { id, token };
  }

  static genKey(): string {
    const seed: string = helpers.pkv.generateSeed();
    return helpers.pkv.generatePKV(seed);
  }

  static userId(data: any) {
    const secret = helpers.jwt.verify(data);
    if (!secret?.success || !secret?.data) return;
    return helpers.crypto.decrypt(secret?.data?.userId);
  }

  static userToken(data: any) {
    const secret = helpers.jwt.verify(data);
    if (!secret?.success || !secret?.data) return;
    return helpers.crypto.decrypt(secret?.data?.userToken);
  }
}

export default CryptoUtils;