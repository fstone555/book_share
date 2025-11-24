const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 3000; // ใช้ port เดียวกับ server

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookShare API",
      version: "1.0.0",
      description: "API สำหรับระบบ BookShare"
    },
    servers: [
      { url: `http://localhost:${PORT}` } // ให้ตรงกับ server port
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./routes/*.js"] // path ของ route
};

const specs = swaggerJsDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
