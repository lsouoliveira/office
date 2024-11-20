module.exports = {
  apps: [
    {
      name: "main-server",
      script: "./dist/main.js",
      cwd: "./server",
      watch: false,
    },
    {
      name: "tennis-server",
      script: "./dist/main.js",
      cwd: "./pong_server",
      watch: false,
    },
  ],
};
