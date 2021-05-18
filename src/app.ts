import express, { NextFunction, Request, Response } from "express";
import friendsRoutesAuth from "./routes/friendRoutesAuth";
import dotenv from "dotenv";
import path from "path";
import { logger, winstonLogger, winstonCallBack } from "./middleware/logger";
import Cors from "cors";
import { ApiError } from "./errors/apierror";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./graphql/schema";
import authMiddleware from "./middleware/basic-auth";
import cors from "cors";

dotenv.config();
const debug = require("debug")("app");
const app = express();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  debug(new Date().toLocaleDateString(), req.method, req.originalUrl, req.ip);
  next();
});

//app.use("/graphql", authMiddleware)

/*app.use("/graphql", (req, res, next) => {
  const body = req.body;

  if (body && body.query && body.query.includes("createFriend")) {
    console.log("Create");
    return next();
  }
  if (body && body.operationName && body.query.includes("IntrospectionQuery")) {
    return next();
  }
  if (body.query && (body.mutation || body.query)) {
    return authMiddleware(req, res, next);
  }
  next();
});*/

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api/friends", friendsRoutesAuth);

app.get("/demo", (req, res) => {
  res.send("Server is up");
});

//Our own default 404-handler for api-requests
app.use("/api", (req: any, res: any, next) => {
  res.status(404).json({ errorCode: 404, msg: "not found" });
});

app.set("logger", winstonLogger);

//Makes JSON error-response for ApiErrors, otherwise pass on to default error handleer
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res
      .status(err.errorCode)
      .json({ errorCode: err.errorCode, msg: err.message });
  } else {
    next(err);
  }
});

export default app;

//logger
//app.use(winstonCallBack);

// error handling
//app.use("/api", (req, res, next) => {
//res.status(404).json({ errorCode: 404, msg: "not found!!!!" });
//});
//SIMPLE LOGGER
//Please verify whether this works (requires app in your DEBUG variable, like DEBUG=www,app)
//If not replace with a console.log statement, or better the "advanced logger" refered to in the exercises

//WINSTON/MORGAN-LOGGER (Use ONLY one of them)
// import logger, { stream } from "./middleware/logger";
// const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
// app.use(require("morgan")(morganFormat, { stream }));

//The line above sets the logger as a global key on the application object
//You can now use it from all your middlewares like this req.app.get("logger").log("info","Message")
//Level can be one of the following: error, warn, info, http, verbose, debug, silly
//Level = "error" will go to the error file in production

/*app.use((err: any, req: Request, res: Response, next: Function) => {
  if (err instanceof ApiError) {
    if (err.errorCode != undefined)
      res.status(404).json({ errorCode: err.errorCode, msg: err.message });
  } else {
    next();
  }
});

app.get("/demo", (req, res) => {
  res.send("Hello World");
});

export default app;*/
