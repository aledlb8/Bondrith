import * as jwt from "jsonwebtoken";

class JWT {
  /**
   * Generates a JSON Web Token (JWT) containing the provided userId and userToken.
   *
   * Signs the JWT payload with the secret from process.env.JWT_SECRET using HS512 algorithm.
   * Sets the token expiration to 100 years.
   *
   * Returns the signed JWT string on success, or undefined if no JWT_SECRET is set.
   */
  static generate(userId: string, userToken: string) {
    if (!process.env.JWT_SECRET || typeof process.env.JWT_SECRET !== "string")
      return;

    const payload: any = {
      userId,
      userToken,
    };

    const options: any = {
      expiresIn: "100y",
      algorithm: "HS512",
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }

  /**
   * Verifies a JSON web token (JWT) using the secret provided.
   * Decodes the JWT payload to extract the user ID and token.
   * Returns an object indicating success/failure and any decoded data.
   */
  static verify(secret: string) {
    // If there is no token, return an error
    if (!secret) {
      return { success: false, message: "Invalid secret" };
    }

    // Verify the JWT and get the user's ID/Token
    let userId: string;
    let userToken: string;
    try {
      if (!process.env.JWT_SECRET || typeof process.env.JWT_SECRET !== "string")
        return;

      const decoded = jwt.verify(secret, process.env.JWT_SECRET);
      // Check the type of the decoded object
      if (typeof decoded === "string") {
        // If the object is a string, return an error
        return { success: false, message: "Internal server error" };
      }
      // If the object is a JwtPayload, access the id property
      userId = decoded.userId;
      userToken = decoded.userToken;

      // return data [ENCRYPTED]
      return { success: true, data: { userId, userToken } };
    } catch (err) {
      return { success: false, message: "Internal server error" };
    }
  }
}

export default JWT;
