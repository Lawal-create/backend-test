declare namespace NodeJS {
  // Merge the existing `ProcessEnv` definition with ours
  // Any variable declared in the .env file here should be typed in the interface below
  export interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DIALECT: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    BCRYPT_SALT: string;
    AWS_ACCESS_ID: string;
    AWS_ACCESS_KEY: string;
    AWS_BUCKET_NAME: string;
    CRON_JOB_SCHEDULE: string;
    DB_PRODUCTION_NAME: string;
  }
}
