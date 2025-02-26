import crypto from "crypto";

export default (val: string): string => {
  return crypto.createHash("sha256").update(val).digest("hex");
};
