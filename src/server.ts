import initApp from "./app";
import https from 'https';
import http from 'http';
import fs from 'fs';
import swaggerUI from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"
import initSocket from "./web-socket/socket.io";

initApp().then((app) => {
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Web Advanced Application development 2023 REST API",
                version: "1.0.1",
                description: "REST server including authentication using JWT and refresh token",
            },
            servers: [{url: "http://localhost:3000",},],
        },
        apis: ["./src/routes/*.ts"],
    };
    const specs = swaggerJsDoc(options);
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

    let server;
    if (process.env.NODE_ENV !== 'prod') {
        console.log('development');
        server = http.createServer(app).listen(process.env.PORT);
    } else {
        console.log("production")
        const options2 = {
            key: fs.readFileSync('/home/st111/web-back/client-key.pem'),
            cert: fs.readFileSync('/home/st111/web-back/client-cert.pem')
        };
        server = https.createServer(options2, app).listen(process.env.HTTPS_PORT);
    }
    initSocket(server);
});
