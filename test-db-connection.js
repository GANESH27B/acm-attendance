const { testConnection } = require('./lib/database');

testConnection().then(isConnected => {
  if (isConnected) {
    console.log('Database connection successful from test script.');
  } else {
    console.error('Database connection failed from test script.');
  }
  process.exit();
});
