require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');

const app = express();
const port = process.env.PORT;
const pool = require('./db');
const { getJobPostings, 
        getJobPostingsPendingNotification, 
        addJob, 
        deleteJob } = require('./utils/jobProcessor');
const { notifyAllJobsPostings } = require('./utils/emailNotification');
const fetchNewJobs = require('./utils/notifyScript');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.send('OK')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/alljobs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'alljobs.html'));
});

app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await getJobPostings();
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs', error);
        res.status(500).send('server error');
    }
})

app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;

    console.log(email);

    try {
        const existingEmail = await pool.query('SELECT * FROM email_subscribers WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already subscribed.' });
        }

        await pool.query('INSERT INTO email_subscribers (email) VALUES ($1)', [email]);
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
            const jobs = response.data.data;

            for (const job of jobs) {
                addJob(job)
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
    const url = process.env.SERVER_URL
    try {
        const response = await axios.get(`${url}/api/jobs`);

        if (response.status === 200) {
            const jobs = response.data

            for (const job of jobs) {
                deleteJob(job)
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
        const response = await pool.query('SELECT * FROM jobs WHERE expiration_date < NOW()')

        if (response.rows[0] != undefined) {
            const jobs = response.rows

            for (const job of jobs) {
                deleteJob(job)
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
        const response = await getJobPostingsPendingNotification();    

        res.json(response)

    } catch (error) {
        console.error(`Error notifying jobs`, error);
        res.status(500).send('Server error');
    }
})

app.get('/api/update_notification_status', async (req, res) => {
    try {
        await pool.query('UPDATE jobs SET notification_sent=true WHERE notification_sent=false');

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
            jobs[0]['postingID'] = 9999999

            addJob(jobs[0]);

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
    const email = process.env.TEST_EMAIL;
    console.log(email)
    const subject = 'New Teacher Job Postings'
    const message = 'This is a test of new teacher job postings automated email service'

    try {
        await sendEmail(email, subject, message);

        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

cron.schedule('* * * * *', async () => {
    console.log("Running scheduled job fetch");
    await fetchNewJobs();
})