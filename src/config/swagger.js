import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tasks API Documentation",
      version: "1.0.0",
      description: "Backend API docs for Projects, Tasks, Auth, Jobs, and AI processing",
    },
    servers: [
      {
        url: "http://localhost:4000/api/v1",
        description: "Local Development Server",
      },
    ],
  },

  // 👇 This tells Swagger where to find your route docs
  apis: ["./src/routes/v1/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);