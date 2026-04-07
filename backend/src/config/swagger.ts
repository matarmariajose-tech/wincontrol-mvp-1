import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wincontrol API",
      version: "1.0.0",
      description: "API for Wincontrol MVP"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: ["src/**/*.ts"]
};

export const swaggerSpec = swaggerJSDoc(options);