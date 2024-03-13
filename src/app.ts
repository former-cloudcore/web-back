import env from "dotenv";
if (process.env.NODE_ENV === "test") {
  env.config({ path: ".env.test" });
} else if (process.env.NODE_ENV === "prod") {
  env.config({ path: ".env.prod" });
} else {
  env.config();
}

import express, { Express } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/router";

const initApp = (): Promise<Express> => {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.once("open", () => console.log("Connected to Database"));
    db.on("error", (error) => console.error(error));
    const url = process.env.DB_URL;
    const schema = process.env.DB_SCHEMA;
    mongoose.connect(url!, { dbName: schema }).then(() => {
      const app = express();
      app.use(cors());
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header("Access-Control-Allow-Credentials", "true");
        next();
      });
      app.use("/api", router);
        app.use(express.static(process.env.CLIENT_PATH));
        app.get("*", (req, res) => {
          res.sendFile(process.env.CLIENT_PATH + "/index.html");
        });
      resolve(app);
    });
  });
  return promise;
};

export default initApp;
