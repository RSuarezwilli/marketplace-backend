require('dotenv/config');
const { loadEnv } = require('./config/env');
const { buildApp } = require('./app');

const env = loadEnv();
const app = buildApp(env);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Marketplace backend escuchando en el puerto ${env.PORT} [${env.NODE_ENV}]`);
});
