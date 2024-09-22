require('dotenv').config();
const express = require('express')
const axios = require('axios');

const app = express()
const port = process.env.PORT
const pool = require('./db');
const { addJob, deleteJob } = require('./utils/jobProcessor')

app.get('/health', (req, res) => {
  res.send('OK')
})

app.get('/api/jobs', async (req, res) => {
    try {
        const response = await pool.query('SELECT * FROM jobs');
        res.json(response.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Server error');
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
        const response = await pool.query('SELECT * FROM jobs WHERE notification_sent=false')

        console.log(response)
        res.json(response.rows)

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})