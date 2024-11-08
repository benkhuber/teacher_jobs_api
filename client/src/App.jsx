import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import AllJobs from './pages/AllJobs.jsx';
import AccountSignUp from './pages/AccountSignUp.jsx';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<AccountSignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/alljobs" element={<AllJobs />} />
        </Routes>
    </Router>
  );
}

export default App;
