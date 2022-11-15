const COLLECTION = 'portfolioStates';

module.exports = {
  async up(db) {
    await db
      .collection(COLLECTION)
      .find()
      .forEach(({ uuid, timestamp }) => {
        db.collection(COLLECTION).updateOne(
          { uuid },
          { $set: { timestamp: new Date(timestamp) } },
        );
      });
  },

  async down(db) {
    await db
      .collection(COLLECTION)
      .find()
      .forEach(({ uuid, timestamp }) => {
        db.collection(COLLECTION).updateOne(
          { uuid },
          { $set: { timestamp: timestamp.getTime() } },
        );
      });
  },
};
