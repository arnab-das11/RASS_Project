import { Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 rounded-full bg-white shadow hover:bg-gray-200 transition">
        <ArrowLeft size={22} />
      </button>

      <main className="flex-grow py-16 px-6 md:px-20">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or need assistance? <br />
            We'd love to hear from you. Our team is here to help you make the
            most out of your learning experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">

          <div className="bg-white shadow-md rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Send a Message
            </h2>
            <form className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              <input
                type="email"
                placeholder="Email Address"
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              <input
                type="text"
                placeholder="Subject"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              <textarea
                placeholder="Your Message"
                rows="5"
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none">
              </textarea>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-all">
                Send Message
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-between bg-white shadow-md rounded-2xl p-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Get in Touch
              </h2>

              <div className="flex items-start gap-3 mb-4">
                <Mail className="text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-700">Email</h3>
                  <p className="text-gray-600">support@learnx.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <Phone className="text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-700">Phone</h3>
                  <p className="text-gray-600">+91 1234567890</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-700">Address</h3>
                  <p className="text-gray-600">
                    LearnX Headquarters, Sonarpur Station Road, Mission Pally,
                    Pin:-700150, Narendrapur, Kolkata, West Bengal, India
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6383.606647773529!2d88.42171217889506!3d22.44187194300862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0272166e4cb263%3A0x27f12170efd9ddee!2sFuture%20Institute%20of%20Engineering%20and%20Management!5e0!3m2!1sen!2sin!4v1761891001518!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FIEM Location"
              ></iframe>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-gray-800 text-white mt-16">
        <Footer />
      </footer>
    </div>
  );
};

export default ContactPage;

