import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await emailjs.send(
        "service_c64iv2l",
        "template_oygdysw", 
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        "NvQQrAUQaFockR7FD" 
      );

      alert("Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Email sending error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <div className="pt-16 md:pt-24 px-6 md:px-20">
        <Navbar />
      </div>

      <main className="flex-grow py-16 px-6 md:px-20">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-7">
            Have questions, feedback, or need assistance?
            <br />
            We'd love to hear from you. Our team is here to help you make the
            most out of your learning experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="bg-white shadow-lg rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="6"
                required
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />

              <button
                type="submit"
                disabled={sending}
                className="bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-between bg-white shadow-lg rounded-3xl p-8 md:p-10">
            <div>
              <h2 className="text-2xl font-semibold mb-8 text-gray-800">
                Get in Touch
              </h2>

              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="text-blue-600" size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Email</h3>
                  <p className="text-gray-600">support@learnx.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="text-blue-600" size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Phone</h3>
                  <p className="text-gray-600">+91 1234567890</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MapPin className="text-blue-600" size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Address</h3>
                  <p className="text-gray-600 leading-7">
                    LearnX Headquarters, Sonarpur Station Road, Mission Pally,
                    Pin:-700150, Narendrapur, Kolkata, West Bengal, India
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6383.606647773529!2d88.42171217889506!3d22.44187194300862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0272166e4cb263%3A0x27f12170efd9ddee!2sFuture%20Institute%20of%20Engineering%20and%20Management!5e0!3m2!1sen!2sin!4v1761891001518!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FIEM Location"
              />
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
