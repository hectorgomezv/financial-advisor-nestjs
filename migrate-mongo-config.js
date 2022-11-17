const config = {
  mongodb: {
    url: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017',
    databaseName: process.env.MONGO_DATABASE_NAME || 'financialAdvisorDB',
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
