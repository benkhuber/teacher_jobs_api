import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import axios from 'axios';

import { notifyJobPostings } from './emailNotification.js';

async function fetchNewJobs() {
    try {
        notifyJobPostings();
        console.log('Script performed successfully.')
    } catch (error) {
        console.error('Error fetching new jobs', error);
    }
}

export default fetchNewJobs;
