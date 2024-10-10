import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      console.log(response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data)
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div>
      <NavBar />
      <h2>All Elementary Teacher Job Listings for Orange County, CA</h2>
      <div className="job-grid">
        {jobs.map((job) => (
          <a
            key={job.position_id}
            className="job-card"
            href={`https://www.edjoin.org/Home/JobPosting/${job.position_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="job-title">{job.position_title}</div>
            <div className="job-details">
              <p><strong>City Name:</strong> {job.city_name || 'Not provided'}</p>
              <p><strong>District:</strong> {job.district_name || 'Not provided'}</p>
              <p><strong>Posted on:</strong> {new Date(job.posting_date).toLocaleDateString()}</p>
              <p><strong>Expiration Date:</strong> {new Date(job.expiration_date).toLocaleDateString()}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AllJobs;
