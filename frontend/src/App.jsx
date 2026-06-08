import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import News from "./pages/News";
import NewsDetails from "./pages/NewsDetails";
import Footer from "./components/Footer";
import RegisterTeam from "./pages/RegisterTeam";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";



function App() {
  return (
    <>
      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/register/:id" element={<RegisterTeam />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
      <Footer />
    </>
  );
}

export default App;