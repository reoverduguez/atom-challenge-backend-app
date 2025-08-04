import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim());

console.log('CORS_ORIGIN', process.env.CORS_ORIGIN);

export const corsOptions: cors.CorsOptions = {
  origin: [process.env.CORS_ORIGIN ?? 'localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// export const corsOptions: cors.CorsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error(`Not allowed by CORS: ${origin}`));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: false,
// };
