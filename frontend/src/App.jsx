import { Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import ForgotPw from './pages/ForgotPw';
import CreateAccount from './pages/CreateAccount';
import EmailSent from './pages/EmailSent'; 
import PWReset from './pages/PWReset';
import PWResetConfirm from './pages/PWResetConfirm';
import Home from './pages/Home';
import Tutorial from './pages/Tutorial';
import Account from './pages/Account';
import Scan from './pages/Scan';
import ReadingColors1 from './pages/ReadingColors1';

const App = () => {

  // after creating pages in ./pages directory, add their route path to here to create navigation flow
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPw />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/email-sent" element={<EmailSent />} />
      <Route path="/password-reset" element={<PWReset />} />
      <Route path="/password-changed" element={<PWResetConfirm />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/account" element={<Account />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/lesson1/colors" element={<ReadingColors1 />} />
    </Routes>
  )
}

export default App;