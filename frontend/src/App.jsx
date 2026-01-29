import { Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome';
import LogIn from './pages/LogIn';

const App = () => {

  // after creating pages in ./pages directory, add their route path to here to create navigation flow
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<LogIn />} />
    </Routes>
  )
}

export default App;