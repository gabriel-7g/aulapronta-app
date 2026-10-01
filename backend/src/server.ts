import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log('');
  console.log('AulaPronta API iniciada.');
  console.log(`Servidor: http://localhost:${env.port}`);
  console.log(`Health:   http://localhost:${env.port}/api/health`);
  console.log('');
});