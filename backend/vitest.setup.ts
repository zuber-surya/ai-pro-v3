process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/propvista?schema=public";
process.env.CORS_ORIGIN ??= "http://localhost:3001";
process.env.PORT ??= "4001";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-min-32-chars!!";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-min-32-chars!";
process.env.STORAGE_ROOT ??= "./storage-test";
