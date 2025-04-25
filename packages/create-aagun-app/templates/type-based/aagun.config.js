import logger from "morgan";

export default {
  app: {
    port: 4002,
    basePath: "",
    hostname: "localhost",
  },
  middleware: {
    cors: {
      enabled: true,
      origin: "*",
    },
    global: [logger("dev")],
  },
  routing: {
    useControllerPathOverride: true,
    autoCrud: true,
    strictMode: false,
  },
  generate: {
    controllerPattern: "inherit",
    addCrudStub: true,
  },
  project: {
    structure: 'type-based'
  }
};
