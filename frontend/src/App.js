import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JobProvider } from './context/JobContext';
import { ApiProvider } from './context/ApiContext';
import Background from './components/Background';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Internships from './pages/Internships';
import './App.css';

function App() {
  return (
    <ApiProvider>
      <JobProvider>
        <Router>
          <div className="App">
            <Background />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/internships" element={<Internships />} />
            </Routes>
          </div>
        </Router>
      </JobProvider>
    </ApiProvider>
  );
}

export default App;
