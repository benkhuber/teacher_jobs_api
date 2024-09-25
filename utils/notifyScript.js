const { getJobPostingsPendingNotification, updateJobNotificationStatus } = require('./jobProcessor');
const { notifyJobPostings } = require('./emailNotification')
require('dotenv').config({ path: '../.env' });

async function fetchNewJobs() {
    try {
        const jobs = await getJobPostingsPendingNotification();
        const jobsExist = jobs.length > 0
    
        if (jobsExist) {
            console.log("Jobs exist");
            notifyJobPostings(jobs);
            updateJobNotificationStatus(jobs);
        } else {
            console.log("No jobs exist");
        }

    } catch (error) {
        console.error('Error fetching new jobs', error);
    }
}

module.exports = fetchNewJobs;
