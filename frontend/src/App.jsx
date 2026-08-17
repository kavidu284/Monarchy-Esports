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
import AdminLogin from "./pages/AdminLogin.jsx";
import AdministrationLogin from "./Adminstrator/AdministrationLogin.jsx";
import Dashboard from "./admin/Dashboard";
import Layout from "./admin/AdminLayout";
import AdminTournaments from "./admin/TournamentsAdmin";
import CreateTournament from "./admin/CreateTournament";
import EditTournament from "./admin/EditTournament";
import Registrationsteam from "./admin/TournamentRegistrations.jsx";
import RegistrationDetails from "./admin/RegistationTeams.jsx";
import NewsAdmin from "./admin/NewsAdmin";
import CreateNews from "./admin/CreateNews";
import Editnews from "./admin/editNews";
import MessagesAdmin from "./admin/MessageAdmin";
import GalleryAdmin from "./admin/GalleryAdmin";
import ApproveTeam from "./admin/approvedTeam.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import TournamentView from "./pages/TournamentView";
import TournamentMatchesAdmin from "./admin/TournamentMatchesAdmin.jsx";
import RoundRobinAdmin from "./admin/RoundRobinAdmin.jsx";
import MatchResultAdmin from "./admin/matchresultadmin.jsx";
import MatchResult from "./pages/matchresult.jsx";
import Administration from "./Adminstrator/Administration.jsx";
import AdministrationLayout from "./Adminstrator/AdministratorLayouut.jsx";
import AdministratorUser from "./Adminstrator/AdministratorUser.jsx";
import AccessDeniedView from "./components/AccessDeniedView.jsx";
import EditRegistration from "./admin/EditTeam.jsx";
import { isSuperAdmin } from "./utils/auth";

function App() {
  const location = useLocation();
  const isPrivateArea =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/administration");

  return (
    <>
      {!isPrivateArea && <Navbar />}

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
        <Route path="/administration/login" element={<AdministrationLogin />} />
        <Route path="/tournament/:id/view" element={<TournamentView />} />
        <Route path="/tournament/:id/results" element={<MatchResult />} />

        {/* PROTECTED ADMIN PANEL WITH PERMISSION GATEKEYS */}
        <Route path="/admin/*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<ProtectedRoute permissionKey="can_view_dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="tournaments" element={<ProtectedRoute permissionKey="can_view_tournaments"><AdminTournaments /></ProtectedRoute>} />
          <Route path="tournaments/create" element={<ProtectedRoute permissionKey="can_create_tournaments"><CreateTournament /></ProtectedRoute>} />
          <Route path="tournaments/edit/:id" element={<ProtectedRoute permissionKey="can_edit_tournaments"><EditTournament /></ProtectedRoute>} />
          <Route path="registrationsteam/:tournamentId" element={<ProtectedRoute permissionKey="can_view_tournaments"><Registrationsteam /></ProtectedRoute>} />
          <Route path="registrations/:id" element={<ProtectedRoute permissionKey="can_view_tournaments"><RegistrationDetails /></ProtectedRoute>} />
          <Route path="tournament/:tournamentId/matches" element={<ProtectedRoute permissionKey="can_manage_matches"><TournamentMatchesAdmin /></ProtectedRoute>} />
          <Route path="tournament/:tournamentId/matches/round-robin" element={<ProtectedRoute permissionKey="can_manage_matches"><RoundRobinAdmin /></ProtectedRoute>} />
          <Route path="tournaments/champions/:id" element={<ProtectedRoute permissionKey="can_publish_results"><MatchResultAdmin /></ProtectedRoute>} />
          <Route path="registrations/:tournamentId/approved" element={<ProtectedRoute permissionKey="can_view_tournaments"><ApproveTeam /></ProtectedRoute>} />
          <Route path="registrations/edit/:id" element={<ProtectedRoute permissionKey="can_edit_tournaments"><EditRegistration/></ProtectedRoute>}/>
          
          {/* NEWS MANAGEMENT (SEPARATE PERMISSION FLAG) */}
          <Route path="news" element={<ProtectedRoute permissionKey="can_manage_news"><NewsAdmin /></ProtectedRoute>} />
          <Route path="news/create" element={<ProtectedRoute permissionKey="can_manage_news"><CreateNews /></ProtectedRoute>} />
          <Route path="news/edit/:id" element={<ProtectedRoute permissionKey="can_manage_news"><Editnews /></ProtectedRoute>} />
          
          {/* CONTACT MESSAGES MANAGEMENT (SEPARATE PERMISSION FLAG) */}
          <Route path="messages" element={<ProtectedRoute permissionKey="can_view_contact_messages"><MessagesAdmin /></ProtectedRoute>} />
          
          <Route path="gallery" element={<ProtectedRoute permissionKey="can_manage_gallery"><GalleryAdmin /></ProtectedRoute>} />
        </Route>

        {/* SUPER ADMIN CONSOLE ROUTES */}
        <Route
          path="/administration"
          element={
            <ProtectedRoute permissionKey="can_manage_users" redirectTo="/administration/login">
              <AdministrationLayout />
            </ProtectedRoute>
          }
        >
          {/* Overview Dashboard */}
          <Route index element={isSuperAdmin() ? <Administration /> : <AccessDeniedView />} />

          {/* User Rights & Staff Accounts */}
          <Route path="users" element={isSuperAdmin() ? <AdministratorUser /> : <AccessDeniedView />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isPrivateArea && <Footer />}
    </>
  );
}

export default App;