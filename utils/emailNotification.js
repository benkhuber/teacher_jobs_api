import dotenv from 'dotenv';
dotenv.config();
import postmark from 'postmark';
import axios from 'axios';

import JobPosting from '../classes/JobPosting.js';
import db from '../classes/Database.js';


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
        const result = await db.query('SELECT * FROM email_subscribers');
        return result.rows;
    } catch (error) {
        console.error('Error retrieving emails:', error);
    }
}

async function getEmailSubscribersJobTypes(emailId) {
    try {
        const result = await db.query(`SELECT * FROM subscriber_job_types WHERE subscriberid=${emailId}`)
        let jobTypes = []
        if (result.rows.length > 0) {
            for (const jobType of result.rows)
            {
                jobTypes.push(jobType.jobtypeid);
            }
        }
        return jobTypes
    } catch (error) {
        console.error('Error getting email subscriber job types', error);
    }
}

async function notifyJobPostings() {
    try {
        const url = process.env.VITE_SERVER_URL
        const apiResponse = await axios.get(`${url}/api/fetch_jobs`);

        if (apiResponse.status === 200) {
            console.log('Successfully fetched');
        } else {
            console.error('Failed to fetch or add new jobs:', apiResponse.status);
        }

        const jobs = await JobPosting.getJobPostingsPendingNotification();
        const emailSubscribers = await getEmailSubscribers();
        const jobsExist = jobs.length > 0;
        const isProduction = await (process.env.NODE_ENV == 'production');
        
        // Uncomment to test email notification in development.
        // const isProduction = process.env.NODE_ENV != 'production'

        if (jobsExist && isProduction) {
            console.log('Jobs exist, sending notification email');
            
            for (const subscriber of emailSubscribers) {
                const email = subscriber.email
                const jobTypes = await getEmailSubscribersJobTypes(subscriber.id);
                let matchingJobs = []

                for (const job of jobs) {
                    if (jobTypes.includes(job.jobtypeid)) {
                        matchingJobs.push(job);
                    }
                }
                const subject = await formatSubjectForEmail(matchingJobs);
                const message = await formatMessageForEmail(matchingJobs);
        
                try {
                    await sendEmail(email, subject, message);
                } catch (error) {
                    console.error(error)
                }
            };
        
        JobPosting.updateJobNotificationStatus();

        } else {
            console.log('No jobs exist or not in production. No email notification sent');
        }
    } catch (error) {
        console.error('Error notifying all job postings');
    }
}

async function formatSubjectForEmail(jobs) {
    let subject = '[Job Alert] New Elementary Teacher Job Posting'

    if (jobs.length > 1) {
        subject = '[Job Alert] New Elementary Teacher Job Postings'
    }

    return subject
}

async function formatMessageForEmail(jobs) {
    let message = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Job Posting(s)</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 80%;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    text-align: center;
                    color: #333333;
                    font-size: 24px;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                li {
                    background: #f9f9f9;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                li strong {
                    display: inline-block;
                    width: 120px;
                    color: #555555;
                }
                .button {
                    display: inline-block;
                    margin-top: 15px;
                    padding: 10px 20px;
                    background-color: #1d72b8;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: background-color 0.3s ease;
                }
                .button:hover {
                    background-color: #155a8c;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>New Job Posting`;

    if (jobs.length > 1) {
        message += `s`
    };
        
    message += `:</h1><ul>`;

    jobs.forEach(job => {
        message += `
            <li>
                <strong>Position:</strong> ${job.positiontitle}<br/>
                <strong>City:</strong> ${job.cityname ? job.cityname : 'No city provided.'}<br/>
                <strong>District:</strong> ${job.districtname ? job.districtname : 'No district provided.'}<br/>
                <strong>Job Type:</strong> ${job.jobtype}<br/>
                <a href="https://edjoin.org/Home/JobPosting/${job.positionid}" target="_blank" class="button">Go To Job Posting</a>
            </li>
        `
    });

    message += `
                </ul>
            </div>
        </body>
        </html>
    `;

    return message;
}

export { sendEmail, notifyJobPostings };