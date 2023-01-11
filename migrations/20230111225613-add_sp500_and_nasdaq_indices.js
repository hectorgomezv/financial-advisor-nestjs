const { v4 } = require('uuid'); // eslint-disable-line @typescript-eslint/no-var-requires

const COLLECTION = 'indices';

module.exports = {
  async up(db) {
    await db.collection(COLLECTION).insertOne({
      uuid: v4(),
      name: 'S&P 500',
      symbol: '%5EGSPC',
      values: [],
    });
    await db.collection(COLLECTION).insertOne({
      uuid: v4(),
      name: 'NASDAQ Composite',
      symbol: '%5EIXIC',
      values: [],
    });
  },

  async down(db) {
    await db.collection(COLLECTION).deleteMany({});
  },
};
