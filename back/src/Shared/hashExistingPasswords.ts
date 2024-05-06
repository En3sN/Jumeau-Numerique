import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../Entity/user.entity';

// Spécifiez le chemin vers votre fichier database.env
const envPath = path.resolve(__dirname, '..', 'database.env');

// Chargez les variables d'environnement à partir du fichier database.env spécifié
dotenv.config({ path: envPath });

const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User],
    synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

async function hashPasswords() {
    try {
        await dataSource.initialize();
        const userRepository = dataSource.getRepository(User);
        const users = await userRepository.find();

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.pwd, 12);
            user.pwd = hashedPassword;
            await userRepository.save(user);
        }

        console.log('All passwords have been hashed and updated.');
    } catch (error) {
        console.error('Error hashing passwords:', error);
    } finally {
        await dataSource.destroy();
    }
}

hashPasswords();
