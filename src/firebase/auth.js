import { getAuth } from 'firebase/auth';
import { app } from './init.js';

export const auth = getAuth(app);
