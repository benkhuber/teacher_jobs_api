require('dotenv').config();
const express = require('express')
const axios = require('axios');

const app = express()
const port = process.env.PORT
const pool = require('./db');
const processJob = require('./utils/jobProcessor')


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
                processJob(job)
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

app.get('/api/clear_jobs', async (req, res) =>{
    try {
        await pool.query('DELETE FROM jobs');
        console.log('Deleted all existing job postings from DB');

        res.send(`Jobs Cleared`)

    } catch (error) {
        console.error('Error clearing job table', error);
        res.status(500).send('Server error');
    } 
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})