const cron = require('node-cron');
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

fetchNewJobs();

cron.schedule('* * * * *', async () => {
    console.log("Running scheduled job fetch");
    await fetchNewJobs();
})