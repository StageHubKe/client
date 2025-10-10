import { Route, Routes } from "react-router-dom"
import LandingPage from "./components/LandingPage"
import Register from "./components/Auth/Register"
import Login from "./components/Auth/Login"
import CreateArtist from "./components/Artist/CreateArtist"
import GetAllArtists from "./components/Artist/GetAllArtists"
import GetArtist from "./components/Artist/GetArtist"
import UpdateArtist from "./components/Artist/UpdateArtist"

function App() {


  return (
      <>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/createArtist" element={<CreateArtist/>}/>
        <Route path="/getAllArtists" element={<GetAllArtists/>}/>
        <Route path="/artist/:id" element={<GetArtist />} />
        <Route path="/updateArtist/:id" element={<UpdateArtist />} />

      </Routes>
      </>
   
 
  )
}

export default App
