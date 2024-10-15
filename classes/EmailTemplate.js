class EmailTemplate {
    constructor(jobData, subscriberEmail) {
        this.subscriberEmail = subscriberEmail;
        this.subject = formatSubjectForEmail(jobData);
        this.message = formatMessageForEmail(jobData);
    }

    async formatSubjectForEmail(jobData) {
        console.log('alright')
    }

    async formatMessageForEmail(jobData) {
        console.log('heyo');
    }
}

module.exports = EmailTemplate;