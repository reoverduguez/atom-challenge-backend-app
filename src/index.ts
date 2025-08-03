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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// export const api = functions.http.onRequest(app);
