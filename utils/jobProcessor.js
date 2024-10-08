const pool = require('../db')

async function getJobPostings() {
  try {
    const jobs = await pool.query('SELECT * FROM jobs');
    return jobs.rows;

  } catch (error) {
    console.error('Error fetching job postings:', error);
  }
}

async function getJobPostingsPendingNotification() {
  try {
    const jobs = await pool.query('SELECT * FROM jobs WHERE notification_sent=false')
    return jobs.rows;

  } catch (error) {
    console.error('Error fetching jobs pending notification', error);
  }
}

async function updateJobNotificationStatus(jobs) {
  try {
    const updatePromises = jobs.map(async (job) => {
      await pool.query(
        `UPDATE jobs 
         SET notification_sent = true 
         WHERE position_id = $1`,
        [job.position_id]
      );
    })

    await Promise.all(updatePromises);
    console.log("all jobs updated successfully");

  } catch (error) {
    console.error(error);
  }
}

async function addJob(job) {
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
      fullTimePartTime: fulltime_parttime,
    } = job;
  
    try {
      const jobExists = await pool.query('SELECT 1 FROM jobs WHERE position_id = $1', [position_id]);
      const notificationSent = false

      if (!jobExists.rows.length > 0) {
        await pool.query(
          `INSERT INTO jobs 
            (position_id, position_title, salary_info, posting_date, expiration_date, full_county_name, city_name, district_name, job_type_id, job_type, fulltime_parttime, notification_sent)
           VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
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
            notificationSent,
          ]
        );
        console.log('Job did not exist in DB, added to DB');
      }
      
    } catch (error) {
      console.error('Error processing job:', error);
    }
  }

async function deleteJob(job) {
  try {
    await pool.query(`DELETE FROM jobs WHERE position_id=${job.position_id}`)
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}
  
  module.exports = {
    getJobPostings,
    getJobPostingsPendingNotification,
    updateJobNotificationStatus,
    addJob,
    deleteJob
  };