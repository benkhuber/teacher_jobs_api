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

    async query(queryText, params) {
        const client = await this.connect();

        try {
            const res = await client.query(queryText, params);
            return res;
        } finally {
            client.release();
        }
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                firstname VARCHAR(255),
                lastname VARCHAR(255)
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

    async ensureJobTypesTable() {
        const client = await this.connect();
        const createJobsTypesTableQuery = `
            CREATE TABLE IF NOT EXISTS job_types (
            id INTEGER PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
            )
        `;

        try {
            await client.query(createJobsTypesTableQuery);
            console.log('Job types table created or exists already.');
        } catch (error) {
            console.error('Error creating job types table:', error);
        } finally {
            client.release();
        }
    }

    async populateJobTypesTable() {
        const client = await this.connect();
        const populateJobTypesTableQuery = `
            INSERT INTO job_types (id, name)
            VALUES
            (2, 'Teacher 1-3'),
            (3, 'Teacher 4-6'),
            (55, 'Teacher Childrens Center'),
            (48, 'Teacher K-6'),
            (64, 'Teacher K-8'),
            (1, 'Teacher Kindergarten'),
            (7, 'Teacher Other'),
            (63, 'Teacher Pre-K')
            ON CONFLICT (id) DO NOTHING;
        `;

        try {
            await client.query(populateJobTypesTableQuery);
            console.log('Job types table populated');
        } catch (error) {
            console.error('Error populating job types table: ', error);
        } finally {
            client.release()
        }
    }

    async ensureSubscriberJobTypesTable() {
        const client = await this.connect();
        const createSubscriberJobTypesTableQuery = `
            CREATE TABLE IF NOT EXISTS subscriber_job_types (
                id SERIAL PRIMARY KEY,
                subscriberID INTEGER NOT NULL,
                jobtypeID INTEGER NOT NULL
            );
        `;

        try {
            await client.query(createSubscriberJobTypesTableQuery);
            console.log('Subscriber job types table created or exists already');
        } catch (error) {
            console.error('Error creating subscriber job types table: ', error);
        } finally {
            client.release();
        }
    }
}

const db = new Database();
db.ensureJobsTable();
db.ensureEmailsTable();
db.ensureJobTypesTable();
db.populateJobTypesTable();
db.ensureSubscriberJobTypesTable();

export default db;