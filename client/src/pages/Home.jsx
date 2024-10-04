import React, { useState } from 'react';

function Home() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      // Send POST request to the backend
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Parse the response JSON and update the message state
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <header>
        <h1>Subscribe to Teacher Job Notifications</h1>
      </header>
      <form id="emailForm" onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email state when input changes
          required
        />
        <button type="submit">Subscribe</button>
      </form>
      <p id="message">{message}</p>
      <a href="/alljobs">See All Current Jobs</a>
    </div>
  );
}

export default Home;
