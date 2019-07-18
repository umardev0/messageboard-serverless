/* eslint-disable no-console */
/* eslint-disable strict */

'use strict';

const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');

module.exports = {
  create: async (event, context) => {
    let bodyObj = {};
    try {
      bodyObj = JSON.parse(event.body);
    } catch (jsonError) {
      console.log('There was an error parsing the body', jsonError);
      return {
        statusCode: 400,
      };
    }
    if (typeof bodyObj.sender === 'undefined'
    || typeof bodyObj.title === 'undefined'
    || typeof bodyObj.content === 'undefined') {
      console.log('Missing parameters');
      return {
        statusCode: 400,
      };
    }

    const putParams = {
      TableName: process.env.DYNAMOSB_MESSAGE_TABLE,
      Item: {
        id: uuidv4(),
        sender: bodyObj.sender,
        title: bodyObj.title,
        content: bodyObj.content,
      },
    };

    let putResult = {};
    try {
      const dynamodb = new AWS.DynamoDB.DocumentClient();
      putResult = await dynamodb.put(putParams).promise();
    } catch (putError) {
      console.log('There was a problem putting the message');
      console.log('putParams', putParams);
      return {
        statusCode: 500,
      };
    }

    return {
      statusCode: 201,
    };
  },

  list: async (event, context) => {
    const scanParams = {
      TableName: process.env.DYNAMOSB_MESSAGE_TABLE,
    };

    let scanResult = {};
    try {
      const dynamodb = new AWS.DynamoDB.DocumentClient();
      scanResult = await dynamodb.scan(scanParams).promise();
    } catch (scanError) {
      console.log('There was a problem putting the message');
      console.log('scanError', scanError);
      return {
        statusCode: 500,
      };
    }

    if (scanResult.Items === null
    || !Array.isArray(scanResult.Items)
    || scanResult.Items.length === 0) {
      return {
        statusCode: 404,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(scanResult.Items.map(message => ({
        id: message.id,
        sender: message.sender,
        title: message.title,
        content: message.content,
      }))),
    };
  },
};

// module.exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2,
//     ),
//   };

// // Use this code if you don't use the http event with the LAMBDA-PROXY integration
// // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };
