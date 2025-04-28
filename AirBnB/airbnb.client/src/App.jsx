import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Cards from "./components/Cards/Cards";
import Filter from "./components/Filter/Filter.jsx";
import Header from "./components/Header/Header";
import Auth from "./components/Authentification/Auth";
import { Routes, Route } from "react-router-dom";
import House from "./components/HousePage/House";
import HouseForm from "./components/Header/HouseForm";
import ProfilePage from "./components/Header/Account Page/AccountPage.jsx";
import Favorites from "./components/Header/Favorite Page/Favorites.jsx";
import SearchResults from "./components/Header/SearchResult.jsx";
import Chat from "./components/Header/MessagePage/Message.jsx";
import PaymentPage from "./components/Payment/PaymentPage.jsx";
import History from "./components/Header/History.jsx";
import YourHome from "./components/Header/YourHome/YourHome.jsx";
function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    axios.get("https://localhost:7149/api/Houses")
      .then(res => {
        setHouses(res.data);
      })
      .catch(err => {
        console.error("Error fetching houses:", err);
      });
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <div>
                <Filter onCategorySelect={setSelectedCategoryId} />
                <Cards list={houses} selectedCategoryId={selectedCategoryId} />
              </div>
            </>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/post/home" element={<HouseForm />} />
        <Route path="/houses/:id" element={<House />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/messages" element={<Chat />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/history" element={<History />} />
        <Route path="/your/home" element={<YourHome />} />
      </Routes>
    </div>
  );
}

export default App;
