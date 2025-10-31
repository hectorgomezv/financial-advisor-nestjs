module.exports = {
  async up(db) {
    // companyStates.timestamp
    await db
      .collection('companyStates')
      .find()
      .forEach(({ uuid, timestamp }) => {
        db.collection('companyStates').updateOne(
          { uuid },
          { $set: { timestamp: new Date(timestamp) } },
        );
      });

    // indices.values[].timestamp
    await db
      .collection('indices')
      .find()
      .forEach(({ uuid, values }) => {
        db.collection('indices').updateOne(
          { uuid },
          {
            $set: {
              values: values.map((v) => ({
                timestamp: new Date(v.timestamp),
                value: v.value,
              })),
            },
          },
        );
      });

    // portfolios.created
    await db
      .collection('portfolios')
      .find()
      .forEach(({ uuid, created }) => {
        db.collection('portfolios').updateOne(
          { uuid },
          { $set: { created: new Date(created) } },
        );
      });

    // portfolios.contributions[].timestamp
    await db
      .collection('portfolios')
      .find()
      .forEach(({ uuid, contributions }) => {
        db.collection('portfolios').updateOne(
          { uuid },
          {
            $set: {
              contributions: contributions.map((contribution) => ({
                ...contribution,
                timestamp: new Date(contribution.timestamp),
              })),
            },
          },
        );
      });
  },

  async down() {
    throw Error('Not implemented');
  },
};
