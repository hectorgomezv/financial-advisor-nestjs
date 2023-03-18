/* eslint-disable @typescript-eslint/no-var-requires */

const { v4 } = require('uuid');
const { eachDayOfInterval } = require('date-fns');

module.exports = {
  async up(db) {
    const dates = eachDayOfInterval({
      start: new Date(2020, 0, 3),
      end: new Date(2022, 6, 16),
    });

    const states = dates.map((date) => ({
      uuid: v4(),
      timestamp: date,
      portfolioUuid: '3d78a8d8-3c49-4dc1-af81-b32863a5f60e',
      isValid: true,
      sumWeights: 100,
      cash: 0,
      roicEUR: 0,
    }));

    const promises = states.map(async (state) => {
      const lastState = await db
        .collection('portfolioStates')
        .find({ timestamp: { $lte: state.timestamp } })
        .sort({ timestamp: 'desc' })
        .limit(1)
        .toArray();

      await db
        .collection('portfolioStates')
        .insertOne({ ...state, totalValueEUR: lastState[0].totalValueEUR });
    });

    await Promise.all(promises);
  },

  async down() {
    throw Error(' Not implemented');
  },
};
