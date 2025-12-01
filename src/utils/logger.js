import fs from "fs";
import path from "path";

const logDir = path.resolve("logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "app.log");

const writeToFile = (data) => {
  fs.appendFile(logFile, data + "\n", (err) => {
    if (err) console.error("Failed to write log:", err);
  });
};

export const logger = {
  info: (req, message, meta = {}) => {
    const log = {
      level: "info",
      reqId: req?.id,
      method: req?.method,
      url: req?.originalUrl,
      userId: req?.user?._id,
      ...meta,
      message,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(log));
    writeToFile(JSON.stringify(log));
  },

  warn: (req, message, meta = {}) => {
    const log = {
      level: "warn",
      reqId: req?.id,
      method: req?.method,
      url: req?.originalUrl,
      userId: req?.user?._id,
      ...meta,
      message,
      timestamp: new Date().toISOString(),
    };

    console.warn(JSON.stringify(log));
    writeToFile(JSON.stringify(log));
  },

  error: (req, message, meta = {}) => {
    const log = {
      level: "error",
      reqId: req?.id,
      method: req?.method,
      url: req?.originalUrl,
      userId: req?.user?._id,
      ...meta,
      message,
      timestamp: new Date().toISOString(),
    };

    console.error(JSON.stringify(log));
    writeToFile(JSON.stringify(log));
  },
};
