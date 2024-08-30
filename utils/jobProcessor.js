const pool = require('../db')

async function processJob(job) {
    const rawPostingDate = parseInt(job['postingDate'].replace('/Date(', '').replace(')/', '')) / 1000;
    const rawExpirationDate = parseInt(job['displayUntil'].replace('/Date(', '').replace(')/', '')) / 1000;
  
    const postingDate = new Date(rawPostingDate * 1000);
    const expirationDate = new Date(rawExpirationDate * 1000);
  
    const {
      postingID: position_id,
      positionTitle: position_title,
      salaryInfo: salary_info,
      fullCountyName: full_county_name,
      city: city_name,
      districtName: district_name,
      jobTypeID: job_type_id,
      jobType: job_type,
      FullTimePartTime: fulltime_parttime,
    } = job;
  
    try {
      const jobExists = await pool.query('SELECT 1 FROM jobs WHERE position_id = $1', [position_id]);
  
      if (jobExists.rows.length > 0) {
        console.log('Job posting exists in DB');
      } else {
        await pool.query(
          `INSERT INTO jobs 
            (position_id, position_title, salary_info, posting_date, expiration_date, full_county_name, city_name, district_name, job_type_id, job_type, fulltime_parttime)
           VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            position_id,
            position_title,
            salary_info,
            postingDate,
            expirationDate,
            full_county_name,
            city_name,
            district_name,
            job_type_id,
            job_type,
            fulltime_parttime,
          ]
        );
        console.log('Job did not exist in DB, added to DB');
      }
    } catch (error) {
      console.error('Error processing job:', error);
    }
  }
  
  module.exports = processJob;