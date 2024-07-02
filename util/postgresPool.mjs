import pg from 'pg';
const { Pool } = pg;

const getDatabaseMapping = () => ({
  'blue-user-token-translator':
    process.env.POSTGRESQL_DATABASE_BLUE_USER_TOKENTRANSLATOR,
});

const postgresPool = (database) => {
  const db = getDatabaseMapping()[database];

  if (!db) {
    throw Error('DB not found');
  }

  const url = process.env.POSTGRESQL_URL + '/' + db;

  return new Pool({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

export default postgresPool;
