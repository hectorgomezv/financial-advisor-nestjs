module.exports = {
  async up(db) {
    await db
      .collection('positions')
      .updateOne(
        { uuid: '854c8391-80df-49cc-8451-68295cc532cd' },
        { $set: { sharesUpdatedAt: new Date('2023-05-30') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: 'af621e70-9b51-43b4-a774-ae93a164948b' },
        { $set: { sharesUpdatedAt: new Date('2023-08-24') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: 'fb7b4c7c-901a-4daa-9b6f-6c1e83170506' },
        { $set: { sharesUpdatedAt: new Date('2023-04-11') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '2681874c-2075-462f-ab4b-3315d4f0629c' },
        { $set: { sharesUpdatedAt: new Date('2023-05-02') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '3b952edc-aa85-4913-aa9d-839720ef53d3' },
        { $set: { sharesUpdatedAt: new Date('2023-08-24') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '2283c61a-3b9f-4af1-a665-c202b6109606' },
        { $set: { sharesUpdatedAt: new Date('2023-08-01') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: 'd6c3208e-4b52-4b61-96c8-19adceae9f9e' },
        { $set: { sharesUpdatedAt: new Date('2023-04-05') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '52ebed0e-419f-45e6-bceb-a9eaef243cdd' },
        { $set: { sharesUpdatedAt: new Date('2023-08-24') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: 'a24988f5-7e97-413e-9817-f563b6de6be7' },
        { $set: { sharesUpdatedAt: new Date('2023-05-30') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: 'd149ac82-1421-45ae-990e-32173e0b1d86' },
        { $set: { sharesUpdatedAt: new Date('2023-08-14') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '6552ca2e-a7dd-4490-aa85-798a3e3f39bc' },
        { $set: { sharesUpdatedAt: new Date('2023-08-08') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: 'acdb68f8-ccc4-41ac-a3d7-c6780a356b28' },
        { $set: { sharesUpdatedAt: new Date('2023-08-07') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: 'dd800208-f1b2-4c8b-a304-840cb7a7b090' },
        { $set: { sharesUpdatedAt: new Date('2023-07-05') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '6085e3bf-14b5-4e2f-8b10-de15484fa04f' },
        { $set: { sharesUpdatedAt: new Date('2023-08-07') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '275be5c8-d777-40dc-89ef-dfeadaa0f5bd' },
        { $set: { sharesUpdatedAt: new Date('2023-08-14') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '231aed8e-a3bd-4bc8-8c32-bc9ee73593eb' },
        { $set: { sharesUpdatedAt: new Date('2023-05-23') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '413fa5f1-5ab2-4244-84e9-aa5a8f415861' },
        { $set: { sharesUpdatedAt: new Date('2023-08-24') } },
      );
    await db
      .collection('positions')
      .updateOne(
        { uuid: '33edc4ba-2d9a-45ed-8136-6f6f60274f74' },
        { $set: { sharesUpdatedAt: new Date('2023-08-18') } },
      );
  },

  async down(db) {
    await db
      .collection('positions')
      .updateMany({}, { $unset: { sharesUpdatedAt: true } });
  },
};
