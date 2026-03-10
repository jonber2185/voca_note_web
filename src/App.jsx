import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import PrivateNotice from "./pages/PrivateNotice";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import My from "./pages/My";
import Search from "./pages/Search";
import CreateSet from "./pages/CreateSet";
import SetDetail from "./pages/SetDetail";
import AddWords from "./pages/AddWords";
import StudyCard from "./pages/StudyCard";
import StudyMultiple from "./pages/StudyMultiple";
import StudyWrite from "./pages/StudyWrite";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/private-notice" element={<PrivateNotice />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/my" element={<My />} />
        <Route path="/search" element={<Search />} />
        <Route path="/create-set" element={<CreateSet />} />
        <Route path="/:userId/:setId" element={<SetDetail />} />
        <Route path="/:userId/:setId/add-words" element={<AddWords />} />
        <Route path="/:userId/:setId/study/card" element={<StudyCard />} />
        <Route path="/:userId/:setId/study/multiple" element={<StudyMultiple />} />
        <Route path="/:userId/:setId/study/write" element={<StudyWrite />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App