export const versionWarning = (req, res, next) => {
  res.setHeader("API-Version", "v1");
  res.setHeader("Deprecation", "false");

  // Example future deprecation support:
  // res.setHeader("Deprecation", "true");
  // res.setHeader("Sunset", "Tue, 01 Dec 2025 00:00:00 GMT");

  next();
};
