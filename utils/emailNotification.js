require('dotenv').config({ path: '../.env' });
const postmark = require("postmark");
const { getJobPostings } = require('./jobProcessor');
const pool = require('../db');

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

async function sendEmail(toEmail, subject, message) {
    try {
        const result = await client.sendEmail({
          "From": "benjamin.huber@colorado.edu",
          "To": toEmail,
          "Subject": subject,
          "HtmlBody": message
        });
    
        console.log("Email sent successfully:", result);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

async function getEmailSubscribers() {
    try {
        const result = await pool.query('SELECT * FROM email_subscribers');
        return result.rows;
    } catch (error) {
        console.error('Error retrieving emails:', error);
    }
}

async function notifyJobPostings(jobs) {
    try {
        const emailSubscribers = await getEmailSubscribers();

        for (const subscriber of emailSubscribers) {
            const email = subscriber.email
            const subject = 'New Teacher Job Postings';
            const message = await formatMessageForEmail(jobs);
    
            try {
                await sendEmail(email, subject, message);
            } catch (error) {
                console.error(error)
            }
        };
    } catch (error) {
        console.error('Error notifying all job postings');
    }
}

async function notifyAllJobsPostings() {
    try {
        const jobs = await getJobPostings();

        if (jobs.length > 0) {
            const email = process.env.TEST_EMAIL;
            const subject = await formatSubjectForEmail(jobs);
            const message = await formatMessageForEmail(jobs);
        
            try {
                await sendEmail(email, subject, message);
            } catch (error) {
                console.error(error)
            }
        } else {
            return 'No jobs'
        }

    } catch (error) {
        console.error('Error notifying all job postings');
    }
}

async function formatSubjectForEmail(jobs) {
    let subject = '[ Alert ] New Elementary Teacher Job Posting'

    if (jobs.length > 1) {
        subject = '[ Alert ] New Elementary Teacher Job Postings'
    }

    return subject
}

async function formatMessageForEmail(jobs) {
    let message = '<h1>New Job(s) Posting(s):</h1><br/><ul>';

    jobs.forEach(job => {
        message += `<li>
            <strong>Position:</strong> ${job.position_title}<br/>
            <strong>City Name:</strong> ${job.city_name}<br/>
            <strong>District Name:</strong> ${job.district_name}<br/>
            <strong>Job Type:</strong> ${job.job_type}<br/>
            <a href="https://edjoin.org/Home/JobPosting/${job.position_id}" target="_blank">Go To Job Posting</a>
        </li><br/><br/>`

        count++;
    })

    message += '</ul>';

    return message;
}

module.exports = { sendEmail, notifyJobPostings, notifyAllJobsPostings };