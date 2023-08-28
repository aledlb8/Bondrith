import { Router } from 'express';

import validation from '../middlewares/auth';
import userController from '../controllers/user';

const router = Router();

router
    .post('/login/:userId', validation.validateAuth, userController.userLogin)
    .post('/access/:userToken', validation.validateAuth, userController.userAccess)

export default router;