import { useState } from 'react';
import Subscriber from '../../../classes/Subscriber.js';

function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTypes, setJobTypes] = useState([]);
  const [message, setMessage] = useState('');

    console.log(jobTypes)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newSubscriber = new Subscriber(email, firstName, lastName, jobTypes);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubscriber),
      });

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  const manageJobTypes = (value) => {
    let currentState = [...jobTypes]
    if (!jobTypes.includes(value)) {
        currentState.push(value)
        setJobTypes(currentState);
    } else {
        let deleteFromState = currentState.filter(e => e !== value)
        setJobTypes(deleteFromState);
    }
    console.log(jobTypes);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Subscribe to Teacher Job Alerts</h2>
        <form id="emailForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="firstname" className="block text-gray-700 font-medium mb-2">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastname" className="block text-gray-700 font-medium mb-2">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
          <label>Jobs Interested In:</label>
          </div>
            <div className="flex flex-col items-start mb-4">

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="2" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher 1-3
                </label>

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="3" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher 4-6
                </label>

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="55" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher - Children&apos;s Center
                </label>

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="48" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher K-6
                </label>

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="64" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher K-8
                </label>

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="1" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher Kindergarten
                </label>

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="7" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher - Other
                </label>

                <label className='ms-2 text-md font-medium'>
                        <input 
                            className='w-4 h-4 text-blue-600 focus:ring-blue-500' 
                            type="checkbox" 
                            name="jobType" 
                            value="63" 
                            onChange={(e) => manageJobTypes(e.target.value)}/>
                        Teacher Pre-K
                </label>

            </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Subscribe
          </button>
        </form>
        {message && <p id="message" className="text-center text-gray-700 mt-4">{message}</p>}
      </div>
    </div>
  );
}

export default SubscribeForm;
