import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';
import { applicationsRouter } from './routes/applications.routes.js';
import { workflowsRouter } from './routes/workflows.routes.js';
import { registriesRouter } from './routes/registries.routes.js';
import { runsRouter } from './routes/runs.routes.js';
import { dependenciesRouter } from './routes/dependencies.routes.js';
import { observabilityRouter } from './routes/observability.routes.js';
import { governanceRouter } from './routes/governance.routes.js';
import { evaluationRouter } from './routes/evaluation.routes.js';
import { a2aRouter } from './routes/a2a.routes.js';
import { errorHandler } from './middleware/envelope.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/v1', healthRouter);
app.use('/api/v1', applicationsRouter);
app.use('/api/v1', workflowsRouter);
app.use('/api/v1', registriesRouter);
app.use('/api/v1', runsRouter);
app.use('/api/v1', dependenciesRouter);
app.use('/api/v1', observabilityRouter);
app.use('/api/v1', governanceRouter);
app.use('/api/v1', evaluationRouter);
app.use('/api/v1', a2aRouter);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 ARC Control Plane API listening on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`   Applications: http://localhost:${PORT}/api/v1/applications`);
  });
}

export default app;
