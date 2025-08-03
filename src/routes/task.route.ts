import express from 'express';

import { create, getTask, getUserTasks, remove, update } from '../controllers/task.controller';
import { authorizeFirebaseToken } from '../middleware/firebaseAuth';

const router = express.Router();

router.use(authorizeFirebaseToken);

router.post('/', create);
router.put('/:id', update);
router.get('/user/:id', getUserTasks);
router.delete('/:id', remove);
router.get('/:id', getTask);

export default router;
