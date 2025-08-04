import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

console.log('CORS_ORIGIN', process.env.CORS_ORIGIN);

export const corsOptions: cors.CorsOptions = {
  origin: [process.env.CORS_ORIGIN ?? 'localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
