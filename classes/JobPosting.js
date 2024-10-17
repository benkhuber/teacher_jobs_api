import db from '../classes/Database.js';

class JobPosting {
    constructor(jobData) {
        const normalizedData = this.normalizeFields(jobData);
 
        this.positionID = normalizedData.positionid;
        this.positionTitle = normalizedData.positiontitle;
        this.salaryInfo = normalizedData.salaryinfo;
        this.postingDate = normalizedData.postingdate;
        this.expirationDate = normalizedData.expirationdate;
        this.fullCountyName = normalizedData.fullcountyname;
        this.cityName = normalizedData.cityname;
        this.districtName = normalizedData.districtname;
        this.jobTypeID = normalizedData.jobtypeid;
        this.jobType = normalizedData.jobtype;
        this.fullTimePartTime = normalizedData.fulltimeparttime;
        this.notificationSent = normalizedData.notificationsent || false;
    }

    normalizeFields(data) {
        return {
            positionid: data.postingID || data.positionid,
            positiontitle: data.positionTitle || data.positiontitle,
            salaryinfo: data.salaryInfo || data.salaryinfo,
            postingdate: this.parseJobDate(data.postingDate) || this.parseJobDate(data.postingdate), 
            expirationdate: this.parseJobDate(data.displayUntil) || this.parseJobDate(data.expirationdate),
            fullcountyname: data.fullCountyName || data.fullcountyname,
            cityname: data.city || data.cityname,
            districtname: data.districtName || data.districtname,
            jobtypeid: data.jobTypeID || data.jobtypeid,
            jobtype: data.jobType || data.jobtype,
            fulltimeparttime: data.fullTimePartTime || data.fulltimeparttime,
            notificationsent: data.notificationSent || data.notificationsent,
        };
    }

    async addJobToDb() {
        try {;
            const jobExists = await this.checkJobExistsInDb();

            if (!jobExists) {
                const query = `
                INSERT INTO jobs
                (positionID, positionTitle, salaryInfo, postingDate, expirationDate, fullCountyName, cityName, districtName, jobTypeID, jobType, fullTimePartTime, notificationSent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `;

                const values = [
                    this.positionID, 
                    this.positionTitle, 
                    this.salaryInfo, 
                    this.postingDate, 
                    this.expirationDate, 
                    this.fullCountyName, 
                    this.cityName,
                    this.districtName, 
                    this.jobTypeID, 
                    this.jobType, 
                    this.fullTimePartTime,
                    this.notificationSent,
                ];

                await db.query(query, values);

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
            await db.query(`DELETE FROM jobs WHERE positionID=${this.positionID}`)
            console.log('deleted');
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    }

    parseJobDate(rawDate) {
        if (rawDate && typeof rawDate === 'string') {
            return new Date(parseInt(rawDate.replace('/Date(', '').replace(')/', '')));
        }
        
        return null
    }

    async checkJobExistsInDb() {
        try {
            const jobExists = await db.query(`SELECT 1 FROM jobs WHERE positionID = ${this.positionID}`);
            return jobExists.rows.length > 0;

        } catch (error) {
            console.log('Error checking if job exists in DB', error);
        }
    }

    static async getAllJobPostingsInDb() {
        try {
            const allJobsInDb = await db.query('SELECT * FROM jobs');
            return allJobsInDb.rows;

        } catch (error) {
            console.error('Error fetching all job postings:', error);
        }
    }

    static async getJobPostingsPendingNotification() {
        try {
            const jobs = await db.query('SELECT * FROM jobs WHERE notificationsent=false')
            return jobs.rows;

        } catch (error) {
            console.error('Error fetching jobs pending notification:', error);
        }
    }

    static async updateJobNotificationStatus() {
        try {
            const jobsPendingUpdate = await this.getJobPostingsPendingNotification();

            const updatePromises = jobsPendingUpdate.map(async (job) => {
                await db.query(
                    `UPDATE jobs 
                     SET notificationsent = true 
                     WHERE positionid = $1`,
                    [job.positionid]
                );
            })

            await Promise.all(updatePromises);
            console.log("all jobs updated successfully");

        } catch (error) {
            console.error('Error updating job notification status:', error);
        }
    }
}

export default JobPosting;