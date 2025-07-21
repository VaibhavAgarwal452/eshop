import swaggerUi from 'swagger-ui-express';
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes';
const swaggerDocument = require('./swagger-output.json');

const host = process.env.HOST ?? 'localhost';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API 123' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});
app.use('/api', router);

app.use(errorMiddleware);
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const server = app.listen(port, () => {
  console.log(`Your auth service is running on http://${host}:${port}`);
  console.log(`Swagger Docs available at http://${host}:${port}/docs`);
});

server.on('error', (err) => {
  console.log('Server Error: ', err);
});
