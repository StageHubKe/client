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

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAP_SECRET_KEY;

const App = () => {
  console.log("Google Maps API Key Loaded:", GOOGLE_MAPS_API_KEY);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/getAllArtists" element={<GetAllArtists />} />
        <Route path="/artist/:id" element={<GetArtist />} />
        <Route path="/chatroom/:conversationId" element={<ChatRoom />} />
        <Route path="/conversations" element={<Conversations />} />

        <Route
          path="/createArtist"
          element={
            <LoadScript
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
              libraries={["places"]}
            >
              <CreateArtist />
            </LoadScript>
          }
        />
        <Route
          path="/updateArtist/:id"
          element={
            <LoadScript
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
              libraries={["places"]}
            >
              <UpdateArtist />
            </LoadScript>
          }
        />
      </Routes>
    </>
  );
};

export default App;