const winston = require('winston');
const express=require("express");
const app=express();
const { Client } = require('elasticsearch');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Create a new Elasticsearch client instance
const client = new Client({ node: 'http://localhost:9200' });

async function logEvent(logData) {
  try {
    const result = await client.index({
      index: 'logs', // Index name where logs will be stored
      body: logData, // Log data to be indexed
    });
    console.log('Log event indexed:', result);
  } catch (error) {
    console.error('Error indexing log event:', error);
  }
}

const esTransport = new ElasticsearchTransport({
  level: 'info', // Minimum log level to be sent to Elasticsearch
  index: 'logs',
  clientOpts: { node: 'http://localhost:9200' }  // Elasticsearch index name
  // Additional Elasticsearch configuration options if needed
  // For example, node URL, basic authentication, etc.
});

// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.Console(), // Log to console for development/debugging
//     new winston.transports.Logstash({
//       host: 'localhost',
//       port: 5000, // Port that Logstash is listening on
//       max_connect_retries: -1, // Retry indefinitely if connection fails
//     }),
//   ],
// });

// logEvent(logData);

// logger.info('This is an info log');
// logger.error('This is an error log');

// const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  // esTransport,
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    esTransport
  ], 
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

logger.info('This is an info log');
logger.error('This is an error log');

app.listen(2001,()=>{
    console.log("server running");
})