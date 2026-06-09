// server.js
const app = require('./app');
const { testConnection } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

(async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log('\n🚀 BookStore Pro API');
    console.log(`   http://localhost:${PORT}/api`);
    console.log(`   ENV: ${process.env.NODE_ENV}\n`);
  });
})();
