const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

const ensureJobsTable = async () => {
  const client = await pool.connect();

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
    await pool.query(createJobsTableQuery);
    console.log('Jobs table created or exists already.');
  } catch (err) {
    console.error('Error creating jobs table:', err);
  } finally {
    client.release();
  }
};

const ensureEmailsTable = async () => {
  const client = await pool.connect();

  const createEmailsTableQuery = `
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
  `;

  try {
    await pool.query(createEmailsTableQuery);
    console.log('Emails table created or exists already.');
  } catch (err) {
    console.error('Error creating jobs table:', err);
  } finally {
    client.release();
  }
}

ensureJobsTable();
ensureEmailsTable();

module.exports = pool;
