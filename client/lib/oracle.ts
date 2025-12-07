import oracledb from 'oracledb';

// Suppress Node.js's experimental warning for the fetch API
process.removeAllListeners('warning');

// Database connection configuration
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
};

type OracleRows = Array<Record<string, any>>;
type OracleOutBinds = Record<string, any>;

/**
 * Executes a SQL query against the Oracle database.
 * @param {string} query - The SQL query to execute.
 * @param {oracledb.BindParameters} [params={}] - The parameters for the query.
 * @returns {Promise<OracleRows | OracleOutBinds | undefined>} A promise that resolves with the query result.
 * @throws {Error} If the query fails.
 */
export async function executeQuery(query: string, params: oracledb.BindParameters = {}): Promise<OracleRows | OracleOutBinds | undefined> {
  let connection;
  try {
    // Get a connection from the pool
    connection = await oracledb.getConnection(dbConfig);
    
    // Execute the query
    const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true });
    
    // Log the raw result for debugging
    console.log('Raw execute result:', result);

    // Return outBinds if they exist and are not empty, otherwise return rows
    if (result.outBinds && Object.keys(result.outBinds).length > 0) {
      for (const key of Object.keys(result.outBinds)) {
        const boundValue = result.outBinds[key];
        if (boundValue instanceof oracledb.ResultSet) {
          const resultSet = boundValue as oracledb.ResultSet<any>;
          const rows = await resultSet.getRows();
          await resultSet.close();
          result.outBinds[key] = rows;
        }
      }
      return result.outBinds;
    }
    return result.rows;
  } catch (err) {
    // Log the error and re-throw it
    console.error('Database query failed:', err);
    throw err;
  } finally {
    // Ensure the connection is closed
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Failed to close database connection:', err);
      }
    }
  }
}

