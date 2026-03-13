import { Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import ForgotPw from "./pages/ForgotPw";
import EmailSent from "./pages/EmailSent";
import PWReset from "./pages/PWReset";
import PWResetConfirm from "./pages/PWResetConfirm";
import Home from "./pages/Home";
import Tutorial from "./pages/Tutorial";
import AccountProgress from "./pages/AccountProgress";
import Account from "./pages/Account";
import ScanUpload from "./pages/ScanUpload";
import ScanCamera from "./pages/ScanCamera";
import ScanResult from "./pages/ScanResults";
import ReadingColors from "./pages/ReadingColors1";
import WritingColors from "./pages/WritingColors";
import Settings from "./pages/Settings";
import ColorsCheckpoint from "./pages/ColorsCheckpoint";
import ColorsBadge from './pages/ColorsBadge';
import AnimalsBadge from './pages/AnimalsBadge';
import AnimalsWriting from './pages/AnimalsWriting';
import AnimalsReading from './pages/AnimalsReading';
import AnimalsCheckpoint from './pages/AnimalsCheckpoint';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPw />} />
      <Route path="/email-sent" element={<EmailSent />} />
      <Route path="/password-reset" element={<PWReset />} />
      <Route path="/password-changed" element={<PWResetConfirm />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/colors/checkpoint" element={<ColorsCheckpoint />} />
      <Route path="/colors/badge" element={<ColorsBadge />} />
      <Route path="/animals/badge" element={<AnimalsBadge />} />
      <Route path="/animals/writing" element={<AnimalsWriting />} />
      <Route path="/animals/reading" element={<AnimalsReading />} />
      <Route path="/animals/checkpoint" element={<AnimalsCheckpoint />} />
      
      

      {/* AALIYAH SCAN FLOW */}
      <Route path="/scan" element={<ScanUpload />} />
      <Route path="/scan/camera" element={<ScanCamera />} />
      <Route path="/scan/results" element={<ScanResult />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/account" element={<Account />} />
      <Route path="/account/progress" element={<AccountProgress />} />
      <Route path="/colors/reading" element={<ReadingColors />} />
      <Route path="/colors/writing" element={<WritingColors />} />
    </Routes>
  );
};

export default App;
