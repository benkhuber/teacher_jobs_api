import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import axios from 'axios';

import JobPosting from '../classes/JobPosting.js';
import { notifyJobPostings } from './emailNotification.js';

async function fetchNewJobs() {
    try {
        const url = process.env.VITE_SERVER_URL
        const apiResponse = await axios.get(`${url}/api/fetch_jobs`);


        if (apiResponse.status === 200) {
            console.log('Successfully fetched');
        } else {
            console.error('Failed to fetch or add new jobs:', apiResponse.status);
        }

        const jobs = await JobPosting.getJobPostingsPendingNotification();
        const jobsExist = jobs.length > 0
    
        if (jobsExist) {
            console.log("Jobs exist");

            if (process.env.NODE_ENV == 'production') {
                notifyJobPostings(jobs);
            }

            JobPosting.updateJobNotificationStatus();
            
        } else {
            console.log("No jobs exist");
        }

    } catch (error) {
        console.error('Error fetching new jobs', error);
    }
}

export default fetchNewJobs;
