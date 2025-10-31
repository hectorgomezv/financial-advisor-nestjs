module.exports = {
  async up(db) {
    await db
      .collection('positions')
      .updateMany({}, { $set: { blocked: false } });
  },

  async down(db) {
    await db
      .collection('positions')
      .updateMany({}, { $unset: { blocked: true } });
  },
};
