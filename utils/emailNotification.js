import dotenv from 'dotenv';
dotenv.config();
import postmark from 'postmark';

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

async function notifyJobPostings(jobs) {
    try {
        const emailSubscribers = await getEmailSubscribers();

        for (const subscriber of emailSubscribers) {
            const email = subscriber.email
            const subject = await formatSubjectForEmail(jobs);
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
        const jobs = await JobPosting.getAllJobPostingsInDb();

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
                <strong>City Name:</strong> ${job.cityname}<br/>
                <strong>District Name:</strong> ${job.districtname}<br/>
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

export { sendEmail, notifyJobPostings, notifyAllJobsPostings };