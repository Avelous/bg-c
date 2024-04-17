import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose, { Error } from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import Ably from "ably";
import * as path from "path";
import userRoutes from "./routes/user";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const envPath = path.resolve(__dirname, "./.env");
dotenv.config({ path: envPath });

/* CONFIGURATIONS */

export const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

/**Ably Setup */

export const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });

const server = http.createServer(app);
/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
const MONGO_URL = process.env.MONGO_URL || "";

app.use("/user", userRoutes);

const connectWithRetry = async () => {
  await ably.connection.once("connected");
  ably.channels.get(`messages`);
  console.log("connecting");
  mongoose
    .connect(MONGO_URL)
    .then(async () => {
      server.listen(PORT, () => console.log(`Server Connected, Port: ${PORT}`));
    })
    .catch(error => {
      console.log(`${error} did not connect`);
      setTimeout(connectWithRetry, 3000);
    });
};

connectWithRetry();
