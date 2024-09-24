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
        position_id INTEGER NOT NULL,
        position_title VARCHAR(255) NOT NULL,
        salary_info VARCHAR(255),
        posting_date TIMESTAMP NOT NULL,
        expiration_date TIMESTAMP,
        full_county_name VARCHAR(255),
        city_name VARCHAR(255),
        district_name VARCHAR(255),
        job_type_id INTEGER,
        job_type VARCHAR(255),
        fulltime_parttime VARCHAR(255),
        notification_sent BOOLEAN DEFAULT FALSE
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
