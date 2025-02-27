import { Request } from "express";
import { UserType } from "../model/user";

export interface AppRequest extends Request {
  user?: UserType;
  requestTime?: string;
}
