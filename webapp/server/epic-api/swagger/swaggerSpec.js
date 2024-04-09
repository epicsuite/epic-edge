const swaggerJSDoc = require('swagger-jsdoc');
const swaggerSchemas = require('./swaggerSchemas');
const swaggerModels = require('./swaggerModels');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'EPIC EDGE API with Swagger',
      version: '1.0.0',
      description:
        'This is a EPIC EDGE API application made with Express and documented with Swagger',
    },
    components: {
      schemas: swaggerSchemas,
      models: swaggerModels,
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
          description: 'Enter the token with the `Bearer: ` prefix, e.g. "Bearer abcde12345".'
        }
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://epic.lanl.gov',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'User',
        description: 'Public user endpoints',
      },
      {
        name: 'Dataset',
        description: 'Public dataset endpoints',
      },
      // {
      //   name: 'Session',
      //   description: 'Public session endpoints',
      // },
      {
        name: 'AuthUser',
        description: 'Authorized user endpoints',
      },
    ],
  },
  // Path to the API docs
  apis: ['./edge-api/routes/*.js', './epic-api/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
