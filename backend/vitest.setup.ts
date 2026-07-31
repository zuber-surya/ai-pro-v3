process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista?schema=public";
process.env.CORS_ORIGIN ??= "http://localhost:3000";
process.env.PORT ??= "4000";
