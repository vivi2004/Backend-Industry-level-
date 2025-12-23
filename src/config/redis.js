import Redis from "ioredis";

// Redis only runs locally, not in production (Render)
const isProduction = process.env.NODE_ENV === "production";

let redis = null;

if (!isProduction) {
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  });

  redis.on("connect", () => {
    console.log("Redis connected (development only)");
  });

  redis.on("error", (err) => {
    console.error("Redis error:", err);
  });
} else {
  console.log("Redis disabled in production");
}

export default redis;
