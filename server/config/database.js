const oracledb = require('oracledb');

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING
};

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('Oracle DB Pool created successfully');
  } catch (err) {
    console.error('Oracle DB connection error:', err);
    process.exit(1);
  }
}

async function close() {
  try {
    await oracledb.getPool().close(0);
    console.log('Oracle DB Pool closed');
  } catch (err) {
    console.error(err);
  }
}

module.exports = { initialize, close };