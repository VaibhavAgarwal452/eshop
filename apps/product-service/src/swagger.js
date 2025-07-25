const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: "Product Service API",
        description: "Swagger docs",
        version: "1.0.0"
    },
    host: "localhost:6002",
    basePath: "/api",
    schemes: ["http"],
}

const outputFile = "./swagger-output.json"
const endpoints = ["./routes/product.routes.ts"]

swaggerAutogen()(outputFile, endpoints, doc)