import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupSwagger } from './swagger';
import healthRoute from './routes/health.route';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
setupSwagger(app);

// Routes
app.use('/health', healthRoute);

export default app;
