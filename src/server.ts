import { createApp } from './app/create-app.js';
import { createDatabase } from './shared/database.js';

const database = createDatabase();
const app = await createApp(database);
const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: process.env.HOST ?? '127.0.0.1' });

