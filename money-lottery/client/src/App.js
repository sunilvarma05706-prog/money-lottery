import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Results from './pages/Results';
import Upcoming from './pages/Upcoming';
import CheckTicket from './pages/CheckTicket';
import HowToBuy from './pages/HowToBuy';
import Contact from './pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ minHeight: '60vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/check" element={<CheckTicket />} />
          <Route path="/how-to-buy" element={<HowToBuy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
