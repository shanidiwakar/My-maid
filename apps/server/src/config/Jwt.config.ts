export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: '15m';
  refreshExpiresIn: '30d';
}