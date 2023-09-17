import crypto from "crypto";

class PKV {
    // Generate a (legitimate) license key
    static generatePKV(seed: any) {
        // Format a number to a fixed-length hexadecimal string
        function toFixedHex(num: any, len: any) {
            return num.toString(16).toUpperCase().padStart(len, "0").substring(0, len);
        }

        // Derive a subKey from the seed (a, b, c being params for bit twiddling)
        function getSubKeyFromSeed(seed: any, a: any, b: any, c: any) {
            if (typeof seed === "string") {
                seed = parseInt(seed, 16);
            }

            a = a % 25;
            b = b % 3;

            let subKey;
            if (a % 2 === 0) {
                subKey = ((seed >> a) & 0x000000ff) ^ (((seed >> b) | c) & 0xff);
            } else {
                subKey = ((seed >> a) & 0x000000ff) ^ ((seed >> b) & c & 0xff);
            }

            return toFixedHex(subKey, 2);
        }

        // Get the checksum for a given serial string
        function getChecksumForSerial(serial: any) {
            let right = 0x00af; // 175
            let left = 0x0056; // 101

            for (var i = 0; i < serial.length; i++) {
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

        // Format the key (XXXX-XXXX-XXXX-XXXX-XXXX)
        function formatKey(key: any) {
            return key.match(/.{4}/g).join("-");
        }

        // Build a list of subKeys (bit twiddling params are arbitrary but can never change)
        const subKeys = [
            getSubKeyFromSeed(seed, 24, 3, 200),
            getSubKeyFromSeed(seed, 10, 0, 56),
            getSubKeyFromSeed(seed, 1, 2, 91),
            getSubKeyFromSeed(seed, 7, 1, 100),
        ];

        // Build the serial (seed + subKeys)
        const serial = seed + subKeys.join("");

        // Build the key (serial + checksum)
        const key = serial + getChecksumForSerial(serial);

        return formatKey(key);

    }

    // Generate a 4-byte hexadecimal seed value
    static generateSeed() {
        const seed = crypto.randomBytes(4).toString("hex");

        return seed.toUpperCase();
    };

    static verify(key: any) {
        function isKeyFormatValid(key: any) {
            return key.length === 24 && key.replace(/-/g, "").length === 20;
        }

        if (!isKeyFormatValid(key)) {
            return false;
        }

        return true;
    };
}

export default PKV;