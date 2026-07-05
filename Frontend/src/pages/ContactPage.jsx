import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post("http://localhost:5000/api/contact", formData);
      if (response.data.success) {
        setStatus({
          type: "success",
          text: response.data.message || "Your message was sent successfully!"
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        setStatus({
          type: "error",
          text: response.data.message || "Something went wrong. Please try again."
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        text: error.response?.data?.message || "Failed to send message. Please connect to the backend server."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">

      <div className="flex-grow pt-16 md:pt-24 pb-16 px-6 md:px-20">
        <Navbar />
      </div>

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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl flex items-start gap-3 border ${status.type === "success"
                        ? "bg-green-50/80 border-green-200 text-green-800 backdrop-blur-sm"
                        : "bg-red-50/80 border-red-200 text-red-800 backdrop-blur-sm"
                      }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />
                    ) : (
                      <AlertCircle className="text-red-600 mt-0.5 shrink-0" size={18} />
                    )}
                    <div className="text-sm font-medium">{status.text}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                disabled={loading}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-55" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                disabled={loading}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-55" />
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                disabled={loading}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-55" />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                required
                disabled={loading}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-55">
              </textarea>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-all font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
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
                  <a
                    href="mailto:jeetdasx23@gmail.com"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all"
                  >
                    jeetdasx23@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <Phone className="text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-700">Phone</h3>
                  <a
                    href="tel:7479106468"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all"
                  >
                    +91 7479106468
                  </a>
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
