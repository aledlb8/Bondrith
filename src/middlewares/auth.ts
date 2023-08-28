import { Request, Response, NextFunction } from 'express';
import helpers from '../helpers';

class validation {
    static validateAuth = (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip.split(":").pop();
        helpers.consola.debug(`Processing request: ${ip}`)

        // Get the authorization token from the header
        const authToken = req.headers['authorization'];
    
        // If no token is provided, return a 401 error
        if (!authToken) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
    
        // Compare the provided token to the token in the .env file
        if (authToken !== process.env.AUTH_TOKEN) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    
        // If the token is valid, proceed to the next middleware or route handler
        next();
    };
}

export default validation;