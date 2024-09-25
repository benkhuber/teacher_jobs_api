const { getJobPostingsPendingNotification, updateJobNotificationStatus } = require('./jobProcessor');
const { notifyJobPostings } = require('./emailNotification')
require('dotenv').config({ path: '../.env' });
const axios = require('axios');

async function fetchNewJobs() {
    try {
        const url = process.env.SERVER_URL
        const apiResponse = await axios.get(`${url}/api/fetch_jobs`);


        if (apiResponse.status === 200) {
            console.log('Successfully fetched');
        } else {
            console.error('Failed to fetch or add new jobs:', apiResponse.status);
        }

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
