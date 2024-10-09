import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import AllJobs from './pages/AllJobs';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/alljobs" element={<AllJobs />} />
        </Routes>
    </Router>
  );
}

export default App;
