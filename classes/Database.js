import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

class Database {
    constructor() {
        const isProduction = process.env.NODE_ENV === 'production';

        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
          });
    }

    async connect() {
        return this.pool.connect();
    }

    async ensureJobsTable() {
        const client = await this.connect();
        const createJobsTableQuery = `
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                positionID INTEGER NOT NULL,
                positionTitle VARCHAR(255) NOT NULL,
                salaryInfo VARCHAR(255),
                postingDate TIMESTAMP NOT NULL,
                expirationDate TIMESTAMP,
                fullCountyName VARCHAR(255),
                cityName VARCHAR(255),
                districtName VARCHAR(255),
                jobTypeID INTEGER,
                jobType VARCHAR(255),
                fullTimePartTime VARCHAR(255),
                notificationSent BOOLEAN DEFAULT FALSE
            );
        `;

        try {
            await client.query(createJobsTableQuery);
            console.log('Jobs table created or exists already.');
        } catch (err) {
            console.error('Error creating jobs table:', err);
        } finally {
            client.release();
        }
    }

    async ensureEmailsTable() {
        const client = await this.connect();
        const createEmailsTableQuery = `
            CREATE TABLE IF NOT EXISTS email_subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
    
        try {
          await client.query(createEmailsTableQuery);
          console.log('Emails table created or exists already.');
        } catch (err) {
          console.error('Error creating emails table:', err);
        } finally {
          client.release();
        }
    }

    async query(queryText, params) {
        const client = await this.connect();

        try {
            const res = await client.query(queryText, params);
            return res;
        } finally {
            client.release();
        }
    }
}

const db = new Database();
db.ensureJobsTable();
db.ensureEmailsTable();

export default db;