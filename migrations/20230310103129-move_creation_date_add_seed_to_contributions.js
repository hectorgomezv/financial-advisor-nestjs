const { v4 } = require('uuid'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  async up(db) {
    await db.collection('portfolios').updateOne(
      {
        uuid: '3d78a8d8-3c49-4dc1-af81-b32863a5f60e',
      },
      { $set: { created: new Date(2022, 11, 30).getTime() } },
    );

    const portfolios = await db
      .collection('portfolios')
      .find({}, { uuid: 1, seed: 1 })
      .toArray();

    await Promise.all(
      portfolios.map(async (portfolio) => {
        await db.collection('portfolios').updateOne(
          { uuid: portfolio.uuid },
          {
            $push: {
              contributions: {
                $each: [
                  {
                    uuid: v4(),
                    timestamp: portfolio.created + 1,
                    amountEUR: portfolio.seed,
                  },
                ],
                $position: 0,
              },
            },
          },
        );
      }),
    );

    await db.collection('portfolios').updateMany({}, { $unset: { seed: 1 } });
  },

  async down() {
    throw Error(' Not implemented');
  },
};
