import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";

// Chargez les variables d'environnement à partir du fichier Database.env
dotenvConfig({ path: 'Database.env' });

const isDev = process.env.NODE_ENV === 'development';

const config = {
    type: 'postgres',
    host: isDev ? process.env.DEV_DATABASE_HOST : process.env.PROD_DATABASE_HOST,
    port: parseInt(isDev ? process.env.DEV_DATABASE_PORT : process.env.PROD_DATABASE_PORT),
    username: isDev ? process.env.DEV_DATABASE_USERNAME : process.env.PROD_DATABASE_USERNAME,
    password: isDev ? process.env.DEV_DATABASE_PASSWORD : process.env.PROD_DATABASE_PASSWORD,
    database: isDev ? process.env.DEV_DATABASE_NAME : process.env.PROD_DATABASE_NAME,
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
