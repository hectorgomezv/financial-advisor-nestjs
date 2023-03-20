module.exports = {
  async up(db) {
    await db.collection('companies').updateMany(
      {},
      {
        $set: {
          metrics: {
            avgEnterpriseToRevenue: 0,
            avgEnterpriseToEbitda: 0,
            avgPeg: 0,
          },
        },
      },
    );
  },

  async down(db) {
    await db
      .collection('companies')
      .updateMany({}, { $unset: { metrics: true } });
  },
};
