import cors from 'cors';
import express from 'express';

import { corsOptions } from './config/cors.config';
import authRouter from './routes/auth.route';
import taskRouter from './routes/task.route';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/task', taskRouter);

const PORT = process.env.PORT || 3000; // Fallback to 3000 for local dev
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
