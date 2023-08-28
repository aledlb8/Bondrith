import * as jwt from 'jsonwebtoken';

class JWT {
    static generate(userId: string, userToken: string) {
        if (!process.env.JWT_SECRET || typeof process.env.JWT_SECRET !== 'string') return;
    
        const payload: any = {
          userId,
          userToken
        };
    
        const options: any = {
            expiresIn: '100y',
            algorithm: 'HS512'
        };
    
        return jwt.sign(payload, process.env.JWT_SECRET, options);
    }

    static verify(secret: string) {
        // If there is no token, return an error
        if (!secret) {
            return { success: false, message: "Invalid secret"}
        }

        // Verify the JWT and get the user's ID/Token
        let userId: string;
        let userToken: string
        try {
            if (!process.env.JWT_SECRET || typeof process.env.JWT_SECRET !== 'string') return;

            const decoded = jwt.verify(secret, process.env.JWT_SECRET);
            // Check the type of the decoded object
            if (typeof decoded === 'string') {
                // If the object is a string, return an error
                return { success: false, message: "Internal server error" }
            }
            // If the object is a JwtPayload, access the id property
            userId = decoded.userId;
            userToken = decoded.userToken;

            // return data [ENCRYPTED]
            return { success: true, data: { userId, userToken } }

        } catch (err) {
            return { success: false, message: "Internal server error" }
        }
    }
}

export default JWT;