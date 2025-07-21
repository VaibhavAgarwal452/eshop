const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: "Auth Service API",
        description: "Swagger docs",
        version: "1.0.0"
    },
    host: "localhost:6001",
    basePath: "/api",
    schemes: ["http"],
}

const outputFile = "./swagger-output.json"
const endpoints = ["./routes/auth.routes.ts"]

swaggerAutogen()(outputFile, endpoints, doc)