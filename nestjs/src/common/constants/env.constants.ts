/**
 * Environment constants for the application
 * Centralizing configuration values makes them easier to maintain and test
 */
export const ENV_CONSTANTS = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '3306', 10),
  DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'root',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'password',
  DATABASE_NAME: process.env.DATABASE_NAME || 'skats_positivliste',
  
  // JWT configuration (if needed)
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
  
  // Mail configuration
  MAIL_HOST: process.env.MAIL_HOST || 'smtp.example.com',
  MAIL_PORT: parseInt(process.env.MAIL_PORT || '587', 10),
  MAIL_USER: process.env.MAIL_USER || 'user@example.com',
  MAIL_PASSWORD: process.env.MAIL_PASSWORD || 'password',
  MAIL_FROM: process.env.MAIL_FROM || 'noreply@example.com',
};
