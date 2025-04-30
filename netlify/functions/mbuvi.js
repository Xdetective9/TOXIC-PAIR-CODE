const serverless = require('serverless-http');
const app = require('../../mbuvi');


const handler = serverless(app);

exports.handler = async (event, context) => {
  return await handler(event, context);
};
