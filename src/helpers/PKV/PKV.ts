/**
 * PKV class provides methods for generating and verifying product keys.
 *
 * generatePKV() takes a seed and uses crypto algorithms to generate a formatted product key string.
 * generateSeed() generates a random hex seed.
 * verify() checks if a key is validly formatted.
 *
 * The class is exported for use in other modules.
 */
import crypto from "crypto";

class PKV {
  static generatePKV(seed: string): string {
    function toFixedHex(num: number, len: number): string {
      return num
        .toString(16)
        .toUpperCase()
        .padStart(len, "0")
        .substring(0, len);
    }

    /**
     * Generates a subkey from the provided seed using bitwise operations.
     *
     * @param seed - The seed to generate the subkey from
     * @param a - First bitshift amount
     * @param b - Second bitshift amount
     * @param c - Value to bitwise AND
     * @returns A hex string representing the generated subkey
     */
    function getSubKeyFromSeed(
      seed: string,
      a: number,
      b: number,
      c: number
    ): string {
      const seedInt = parseInt(seed, 16);
      const aMod = a % 25;
      const bMod = b % 3;

      let subKey: number;

      if (aMod % 2 === 0) {
        subKey =
          ((seedInt >> aMod) & 0x000000ff) ^ (((seedInt >> bMod) | c) & 0xff);
      } else {
        subKey =
          ((seedInt >> aMod) & 0x000000ff) ^ ((seedInt >> bMod) & c & 0xff);
      }

      return toFixedHex(subKey, 2);
    }

    /**
     * Calculates a checksum for the provided serial number
     * using a simple additive algorithm.
     *
     * @param serial - The serial number to calculate the checksum for
     * @returns A 4 character hex string representing the checksum
     */
    function getChecksumForSerial(serial: string): string {
      let right = 0x00af; // 175
      let left = 0x0056; // 101

      for (let i = 0; i < serial.length; i++) {
        right += serial.charCodeAt(i);
        if (right > 0x00ff) {
          right -= 0x00ff;
        }

        left += right;
        if (left > 0x00ff) {
          left -= 0x00ff;
        }
      }

      return toFixedHex((left << 8) + right, 4);
    }

    function formatKey(key: string): string {
      return key.match(/.{4}/g)!.join("-");
    }

    const subKeys = [
      getSubKeyFromSeed(seed, 24, 3, 200),
      getSubKeyFromSeed(seed, 10, 0, 56),
      getSubKeyFromSeed(seed, 1, 2, 91),
      getSubKeyFromSeed(seed, 7, 1, 100),
    ];

    const serial = seed + subKeys.join("");
    const key = serial + getChecksumForSerial(serial);

    return formatKey(key);
  }

  static generateSeed(): string {
    const seed = crypto.randomBytes(4).toString("hex").toUpperCase();
    return seed;
  }

  static verify(key: string): boolean {
    function isKeyFormatValid(key: string): boolean {
      return key.length === 24 && key.replace(/-/g, "").length === 20;
    }

    return isKeyFormatValid(key);
  }
}

export default PKV;
