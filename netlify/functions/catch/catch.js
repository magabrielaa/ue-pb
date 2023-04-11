import {MongoClient} from 'mongodb';

export function errorResponse(callback, err) {
  console.error(err);

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({error: err})
  });
}

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'ue-pb';

export const handler = (event, context, callback) => {
  let submission;
  try {
    submission = JSON.parse(event.body);
  } catch (e) {
    errorResponse(callback, 'Bad submit');
    return;
  }
  MongoClient.connect(`${DB_URL}/${DB_NAME}`)
    .then((connection) => {
      const db = connection.db(DB_NAME);
      const collection = db.collection('submission');

      collection
        .insertOne({...submission, createdAt: new Date()})
        .then(() => {
          connection.close();
          callback(null, {
            statusCode: 200,
            body: JSON.stringify({status: 'success'})
          });
          context.done();
        })
        .catch((err) => {
          return errorResponse(callback, err);
        });
    })
    .catch((err) => {
      return errorResponse(callback, err);
    });
};
