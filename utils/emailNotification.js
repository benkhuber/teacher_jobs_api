require('dotenv').config();
const postmark = require("postmark");
const { getJobPostings } = require('./jobProcessor');

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

async function notifyAllJobsPostings() {
    try {
        const jobs = await getJobPostings();

        if (jobs.length > 0) {
            const email = process.env.TEST_EMAIL;
            const subject = 'New Teacher Job Postings';
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

async function formatMessageForEmail(jobs) {
    let message = '<h1>All Current Job Postings:</h1><br/><ul>';
    let count = 1;

    jobs.forEach(job => {
        message += `<li>
            <strong>Number:</strong> ${count}<br/>
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

module.exports = { sendEmail, notifyAllJobsPostings };