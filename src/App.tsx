import { Route, Routes } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";

import LandingPage from "./components/LandingPage";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";

import CreateArtist from "./components/Artist/CreateArtist";
import GetAllArtists from "./components/Artist/GetAllArtists";
import GetArtist from "./components/Artist/GetArtist";
import UpdateArtist from "./components/Artist/UpdateArtist";

import ChatRoom from "./components/Chatroom/ChatRoom";
import Conversations from "./components/Chatroom/Conversations";

import CreateGigPoster from "./components/Poster/CreateGigPoster";
import GigPosterList from "./components/Poster/GigPosterList";
import GigPosterDetails from "./components/Poster/GigPosterDetails";
import EditGigPoster from "./components/Poster/EditGigPoster";
import SingleBid from "./components/Bids/SingleBid";
// import MyBids from "./components/Bids/MyBids";
import MyBidsList from "./components/Bids/MyBidsList";
import { useDispatch} from "react-redux";
import { useEffect } from "react";
import { fetchCurrentUser } from "../redux/reducers/authReducer/authSlice";
import type { AppDispatch} from "../redux/store";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAP_SECRET_KEY;

// Wrapper to automatically load Google Maps for components needing places autocomplete
const WithGoogleMaps = ({ children }: { children: React.ReactNode }) => (
  <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
    {children}
  </LoadScript>
);

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  console.log("Google Maps API Key Loaded:", GOOGLE_MAPS_API_KEY);

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Artist Routes */}
      <Route path="/getAllArtists" element={<GetAllArtists />} />
      <Route path="/artist/:id" element={<GetArtist />} />
      <Route
        path="/createArtist"
        element={
          <WithGoogleMaps>
            <CreateArtist />
          </WithGoogleMaps>
        }
      />
      <Route
        path="/updateArtist/:id"
        element={
          <WithGoogleMaps>
            <UpdateArtist />
          </WithGoogleMaps>
        }
      />

      {/* Chat Routes */}
      <Route path="/conversations" element={<Conversations />} />
      <Route path="/chatroom/:conversationId" element={<ChatRoom />} />

      {/* Gig Poster Routes */}
      <Route path="/gig-posts" element={<GigPosterList />} />
      <Route path="/gig-post/:id" element={<GigPosterDetails />} />
      <Route
        path="/create-gig"
        element={
          <WithGoogleMaps>
            <CreateGigPoster />
          </WithGoogleMaps>
        }
      />
      <Route
        path="/edit-gig/:id"
        element={
          <WithGoogleMaps>
            <EditGigPoster />
          </WithGoogleMaps>
        }
      />
      <Route path="/bid/:bidId" element={<SingleBid />} />
      <Route path="/my-bids" element={<MyBidsList />} />
    </Routes>
  );
};

export default App;
