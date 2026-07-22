import type { User } from '../common/database/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
