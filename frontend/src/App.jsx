import { Routes, Route, useLocation } from "react-router-dom";
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
import About from "./pages/About";
import Rules from "./pages/Rules";
import AdminLanding from "./pages/AdminLanding";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./admin/Dashboard";
import Layout from "./admin/AdminLayout";
import AdminTournaments from "./admin/TournamentsAdmin";
import CreateTournament from "./admin/CreateTournament";
import EditTournament from "./admin/EditTournament";
import Registrationsteam from  "./admin/TournamentRegistrations.jsx";
import RegistrationDetails from "./admin/RegistationTeams.jsx";
import NewsAdmin from "./admin/NewsAdmin";
import CreateNews from "./admin/CreateNews";
import Editnews from "./admin/editNews";
import MessagesAdmin from "./admin/MessageAdmin";
import GalleryAdmin from "./admin/GalleryAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import TournamentView from "./pages/TournamentView";
import TournamentMatchesAdmin from "./admin/TournamentMatchesAdmin.jsx";
import RoundRobinAdmin from "./admin/RoundRobinAdmin.jsx";




function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/register/:id" element={<RegisterTeam />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/admin" element={<AdminLanding />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/tournament/:id/view" element={<TournamentView />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/admin/*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
          <Route path="tournaments" element={<ProtectedRoute><AdminTournaments /></ProtectedRoute>} />
          <Route path="tournaments/create" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
          <Route path="tournaments/edit/:id" element={<ProtectedRoute><EditTournament /></ProtectedRoute>} />
          <Route path="registrations/:id" element={<ProtectedRoute><RegistrationDetails /></ProtectedRoute>} />
          <Route path="news" element={<ProtectedRoute><NewsAdmin /></ProtectedRoute>} />
          <Route path="news/create" element={<ProtectedRoute><CreateNews /></ProtectedRoute>} />
          <Route path="news/edit/:id" element={<ProtectedRoute><Editnews /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute><MessagesAdmin /></ProtectedRoute>} />
          <Route path="gallery" element={<ProtectedRoute><GalleryAdmin /></ProtectedRoute>} />
          <Route path="registrationsteam/:tournamentId" element={<ProtectedRoute><Registrationsteam /></ProtectedRoute>} />
          <Route path="tournament/:tournamentId/matches" element={<ProtectedRoute><TournamentMatchesAdmin /></ProtectedRoute>} />
          <Route path="tournament/:tournamentId/matches/round-robin" element={<ProtectedRoute><RoundRobinAdmin /></ProtectedRoute>} />
        </Route>
      </Routes>
       {!isAdmin && <Footer />}
    </>
  );
}

export default App;