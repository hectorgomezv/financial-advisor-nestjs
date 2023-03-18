const { MONGO_CONNECTION_STRING, MONGO_DATABASE_NAME } = process.env;

const config = {
  mongodb: {
    url:
      `${MONGO_CONNECTION_STRING}?authSource=${MONGO_DATABASE_NAME}` ||
      'mongodb://localhost:27017',
    databaseName: MONGO_DATABASE_NAME || 'financialAdvisorDB',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
