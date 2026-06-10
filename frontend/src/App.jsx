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
import RegistrationsAdmin from "./admin/registrationAdmin.jsx";
import RegistrationDetails from "./admin/registationDetails.jsx";
import NewsAdmin from "./admin/NewsAdmin";
import CreateNews from "./admin/CreateNews";
import Editnews from "./admin/editNews";



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
        <Route path="*" element={<NotFound />} />
        <Route path="/admin/*" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          <Route path="tournaments/create" element={<CreateTournament />} />
          <Route path="tournaments/edit/:id" element={<EditTournament />} />
          <Route path="registrations" element={<RegistrationsAdmin />} />
          <Route path="registrations/:id" element={<RegistrationDetails />} />
          <Route path="news" element={<NewsAdmin />} />
          <Route path="news/create" element={<CreateNews />} />
          <Route path="news/edit/:id" element={<Editnews />} />
        </Route>
      </Routes>
       {!isAdmin && <Footer />}
    </>
  );
}

export default App;