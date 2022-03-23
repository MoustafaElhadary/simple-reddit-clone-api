import { Request, Response, NextFunction } from "express";

import { Error } from "../types/types";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status = 500, message = "something went wrong" } = error;
  res.status(status).json({ message });
};
