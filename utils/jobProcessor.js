const pool = require('../db')

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

async function deleteJob(job) {
  try {
    await pool.query(`DELETE FROM jobs WHERE position_id=${job.position_id}`)
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}
  
  module.exports = {
    updateJobNotificationStatus,
    deleteJob
  };