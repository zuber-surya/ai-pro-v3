import { Router } from "express";
import { agentsRouter } from "./agents.routes.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { leadsRouter } from "./leads.routes.js";
import { propertiesRouter } from "./properties.routes.js";
import { aiSearchRouter, searchRouter } from "./search.routes.js";
import { usersRouter } from "./users.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/agents", agentsRouter);
apiRouter.use("/properties", propertiesRouter);
apiRouter.use("/leads", leadsRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/ai", aiSearchRouter);
