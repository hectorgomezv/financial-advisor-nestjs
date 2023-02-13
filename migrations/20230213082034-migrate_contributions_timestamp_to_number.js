const COLLECTION = 'portfolios';

const updatePortfolioContributions = async (portfolio, db) =>
  db.collection(COLLECTION).updateOne(
    { uuid: portfolio.uuid },
    {
      $set: {
        contributions: portfolio.contributions.map((contribution) => ({
          ...contribution,
          timestamp:
            new Date(contribution.timestamp).getTime() +
            Math.floor(Math.random() * 10000),
        })),
      },
    },
  );

module.exports = {
  async up(db) {
    const portfolios = await db.collection(COLLECTION).find({}).toArray();
    return Promise.all(
      portfolios.map((portfolio) =>
        updatePortfolioContributions(portfolio, db),
      ),
    );
  },

  async down() {
    throw Error(' Not implemented');
  },
};
