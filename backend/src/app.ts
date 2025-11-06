import express from "express";

import routes from "./routes/index";

const app = express();
app.use(express.json());

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

export default app;
