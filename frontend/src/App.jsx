import { Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import ForgotPw from './pages/ForgotPw';
import CreateAccount from './pages/CreateAccount';

const App = () => {

  // after creating pages in ./pages directory, add their route path to here to create navigation flow
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPw />} />
      <Route path="/create-account" element={<CreateAccount />} />
    </Routes>
  )
}

export default App;