import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;

import { notifyJobPostings, 
         notifyAllJobsPostings } from './utils/emailNotification.js';
import fetchNewJobs from './utils/notifyScript.js';
import JobPosting from './classes/JobPosting.js';
import db from './classes/Database.js';
import Subscriber from './classes/Subscriber.js';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('/health', (req, res) => {
  res.send('OK')
})

app.get('/api/jobs', async (req, res) => {
    try {
        const allJobsInDb = await JobPosting.getAllJobPostingsInDb();
        res.json(allJobsInDb);

    } catch (error) {
        console.error('Error fetching jobs', error);
        res.status(500).send('server error');
    }
})

app.post('/api/subscribe', async (req, res) => {
    const { email, firstName, lastName, jobTypes } = req.body;

    const newSubscriber = new Subscriber(email, firstName, lastName, jobTypes);

    console.log(newSubscriber);

    try {
        const existingEmail = await db.query('SELECT * FROM email_subscribers WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already subscribed.' });
        }

        await db.query('INSERT INTO email_subscribers (email, firstname, lastname) VALUES ($1, $2, $3)', 
            [newSubscriber.email, newSubscriber.firstName, newSubscriber.lastName]);
        res.status(200).json({ message: 'Thank you for subscribing!' });

    } catch (error) {
        console.error('Error subscribing email:', error);
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
})

app.get('/api/fetch_jobs', async (req, res) => {
    const url = process.env.API_URL;
    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            const jobData = response.data.data;

            for (const job of jobData) {
                const newJobPosting = new JobPosting(job);

                newJobPosting.addJobToDb();
            }
            res.send(`Status: ${response.status}, collecting jobs...`);
        } else {
            console.log(`Request failed: ${response.status}`);
            res.status(response.status).send(`Request failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Server error');
    }
})

app.get('/api/clear_all_jobs', async (req, res) => {
    const url = process.env.VITE_SERVER_URL
    try {
        const response = await axios.get(`${url}/api/jobs`);

        if (response.status === 200) {
            const jobs = response.data

            for (const job of jobs) {
                jobPendingDeletion = new JobPosting(job)
                jobPendingDeletion.deleteJobFromDb()

            }
        }
        res.send(`Status: ${response.status}, clearing jobs...`);

    } catch (error) {
        console.error('Error clearing job table', error);
        res.status(500).send('Server error');
    } 
})

app.get('/api/clear_expired_jobs', async (req, res) => {
    try {
        const response = await db.query('SELECT * FROM jobs WHERE expirationdate < NOW()')

        if (response.rows[0] != undefined) {
            const jobs = response.rows

            for (const job of jobs) {
                console.log(job);
                const jobPendingDeletion = new JobPosting(job)
                jobPendingDeletion.deleteJobFromDb();
                console.log("deleting expired job");
            }
            res.send(`Status: ${response.status}, deleting expired jobs.`);
        } else {
            console.log('No expired jobs found');
            res.send(`No expired jobs found.`);
        } 
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
})

app.get('/api/jobs_pending_notification', async (req, res) => {
    try {
        const response = await JobPosting.getJobPostingsPendingNotification();    

        res.json(response)

    } catch (error) {
        console.error(`Error notifying jobs`, error);
        res.status(500).send('Server error');
    }
})

app.get('/api/update_notification_status', async (req, res) => {
    try {
        const response = await JobPosting.updateJobNotificationStatus();

        res.send('Notification status updated');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.get('/api/add_test_job_posting', async (req, res) => {
    const url = process.env.API_URL;
    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            const jobs = response.data.data;

            jobs[0]['displayUntil'] = '/Date(1695055800000)/'
            jobs[0]['positionID'] = 9999999

            newJobPosting = new JobPosting(jobs[0]);
            newJobPosting.addJobToDb();

            res.send(`Status: ${response.status}, collecting jobs...`);
        } else {
            console.log(`Request failed: ${response.status}`);
            res.status(response.status).send(`Request failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Server error');
    }
})

app.get('/api/notify_all_jobs', async (req, res) => {
    try {
        const response = await notifyAllJobsPostings();
        res.send(`sending notification`)

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Server error');
    }
})

app.get('/api/test_notify', async (req, res) => {
    try {
        const jobs = await JobPosting.getJobPostingsPendingNotification();
        const jobsExist = jobs.length > 0
    
        console.log(jobs)
        console.log(jobsExist);

        if (jobsExist) {
            console.log("Jobs exist");
                
            notifyJobPostings(jobs);
            JobPosting.updateJobNotificationStatus();
            
        } else {
            console.log("No jobs exist");
        }

    } catch (error) {
        console.error('Error fetching new jobs', error);
    }
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

cron.schedule('*/30 * * * *', async () => {
    console.log("Running scheduled job fetch");
    await fetchNewJobs();
})