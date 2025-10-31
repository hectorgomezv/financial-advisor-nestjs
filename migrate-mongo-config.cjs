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
  migrationFileExtension: '.cjs',
  useFileHash: false,
};

module.exports = config;
