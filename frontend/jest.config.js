/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**",
    "lib/**",
    "stores/**",
    "hooks/**",
    // Exclusions (#1840): tests, the sandbox and type-only files.
    "!**/*.test.*",
    "!**/*.spec.*",
    "!**/tests/**",
    "!**/sandbox/**",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    // Measured baseline with the #1840 globs above — the gate now reflects
    // the real coverage of the app instead of a hand-picked file list.
    global: {
      branches: 50.64,
      functions: 51.3,
      lines: 59.16,
      statements: 58.83,
    },
  },
};

module.exports = config;
