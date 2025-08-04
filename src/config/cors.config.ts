import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const corsOptions: cors.CorsOptions = {
  origin: [process.env.CORS_ORIGIN ?? 'localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};
