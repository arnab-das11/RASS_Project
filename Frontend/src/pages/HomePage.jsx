import Navbar from '../components/Navbar';
import Header from '../components/Header';
import List from '../components/List';
import Footer from '../components/Footer';
import SponsorSection from '../components/SponsorSection';
import HeroSection from '../components/HeroSection';
import FeedbackSection from '../components/FeedbackSection';


const HomePage = () => {
  return (
    <>
      <Navbar/>
      <Header/>
      <List/>
      <SponsorSection/>
      <HeroSection/>
      <FeedbackSection/>
      <Footer/>
    </>
  )
}

export default HomePage;
