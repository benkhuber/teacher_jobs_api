const pool = require('../db');

class JobPosting {
    constructor(jobData) {
        this.postingID = jobData.postingID
        this.positionTitle = jobData.positionTitle
        this.salaryInfo = jobData.salaryInfo
        this.postingDate = this.parseJobDate(jobData.postingDate)
        this.expirationDate = this.parseJobDate(jobData.displayUntil)
        this.fullCountyName = jobData.fullCountyName
        this.cityName = jobData.city
        this.districtName = jobData.districtName
        this.jobTypeID = jobData.jobTypeID
        this.jobType = jobData.jobType
        this.fullTimePartTime = jobData.fullTimePartTime
        this.notificationSent = false;
    }

    async addJobToDb() {
        try {;
            const jobExists = await this.checkJobExistsInDb();

            if (!jobExists) {
                const query = `
                INSERT INTO jobs
                (position_id, position_title, salary_info, posting_date, expiration_date, full_county_name, city_name, district_name, job_type_id, job_type, fulltime_parttime, notification_sent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `;

                const values = [
                    this.postingID, 
                    this.positionTitle, 
                    this.salaryInfo, 
                    this.postingDate, 
                    this.expirationDate, 
                    this.fullCountyName, 
                    this.city,
                    this.districtName, 
                    this.jobTypeID, 
                    this.jobType, 
                    this.fullTimePartTime,
                    this.notificationSent,
                ];

                await pool.query(query, values);

                console.log('Job did not exist in DB, added to DB');

            } else {
                console.log('Job already exists in DB');
            }
        } catch (error) {
            console.error('Error adding job to DB', error);
        }
    }

    async deleteJobFromDb() {
        try {
            await pool.query(`DELETE FROM jobs WHERE position_id=${this.postingID}`)
        } catch (error) {
            console.error('Error deleting job:', error);
        }
        console.log('deleted');
    }

    parseJobDate(rawDate) {
        return new Date(parseInt(rawDate.replace('/Date(', '').replace(')/', '')));
    }

    async checkJobExistsInDb() {
        try {
            const jobExists = await pool.query(`SELECT 1 FROM jobs WHERE position_id = ${this.postingID}`);
            return jobExists.rows.length > 0;

        } catch (error) {
            console.log('Error checking if job exists in DB', error);
        }
    }

    static async getAllJobPostingsInDb() {
        try {
            const allJobsInDb = await pool.query('SELECT * FROM jobs');
            console.log(allJobsInDb.rows);
            return allJobsInDb.rows;

        } catch (error) {
            console.error('Error fetching all job postings:', error);
        }
    }

    static async getJobPostingsPendingNotification() {
        try {
            const jobs = await pool.query('SELECT * FROM jobs WHERE notification_sent=false')
            return jobs.rows;

        } catch (error) {
            console.error('Error fetching jobs pending notification:', error);
        }
    }

    static async updateJobNotificationStatus() {
        try {
            const jobsPendingUpdate = await this.getJobPostingsPendingNotification();

            const updatePromises = jobsPendingUpdate.map(async (job) => {
                await pool.query(
                    `UPDATE jobs 
                     SET notification_sent = true 
                     WHERE position_id = $1`,
                    [job.position_id]
                );
            })

            await Promise.all(updatePromises);
            console.log("all jobs updated successfully");

        } catch (error) {
            console.error('Error updating job notification status:', error);
        }
    }
}

module.exports = JobPosting;