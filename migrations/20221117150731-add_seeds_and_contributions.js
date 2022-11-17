const COLLECTION = 'portfolios';

module.exports = {
  async up(db) {
    await db
      .collection(COLLECTION)
      .updateMany({}, { $set: { seed: 0, contributions: [], cash: 0 } });
  },

  async down(db) {
    await db
      .collection(COLLECTION)
      .updateMany(
        {},
        { $unset: { seed: true, contributions: true, cash: true } },
      );
  },
};
