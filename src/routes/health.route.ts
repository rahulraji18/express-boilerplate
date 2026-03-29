import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check point
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', healthController.check.bind(healthController));

export default router;
