import { useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";

import githubLogo from "../assets/github.png";
import vercelLogo from "../assets/vercel.png";
import netlifyLogo from "../assets/netlify.png";
import cloudinaryLogo from "../assets/cloudinary.png";
import geminiLogo from "../assets/gemini.png";
import chatgptLogo from "../assets/chatgpt.png";
import youtubeLogo from "../assets/youtube.png";
import twitterLogo from "../assets/twitter.png";
import awsLogo from "../assets/aws.png";
import googlecloudLogo from "../assets/googlecloud.png";

const sponsors = [
  { name: "GitHub", logo: githubLogo, link: "https://github.com/login" },
  { name: "Vercel", logo: vercelLogo, link: "https://vercel.com/login" },
  { name: "Netlify", logo: netlifyLogo, link: "https://app.netlify.com/" },
  { name: "Cloudinary", logo: cloudinaryLogo, link: "https://cloudinary.com/users/login" },
  { name: "Gemini AI", logo: geminiLogo, link: "https://gemini.google.com/app" },
  { name: "ChatGPT", logo: chatgptLogo, link: "https://chat.openai.com/auth/login" },
  { name: "YouTube", logo: youtubeLogo, link: "https://youtube.com" },
  { name: "Twitter (X)", logo: twitterLogo, link: "https://x.com/i/flow/login" },
  { name: "AWS Cloud", logo: awsLogo, link: "https://aws.amazon.com/" },
  { name: "Google Cloud", logo: googlecloudLogo, link: "https://console.cloud.google.com/" },
];

const SponsorSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [x, setX] = useState(0);

  // Infinite marquee animation
  useAnimationFrame((t, delta) => {
    if (!isPaused) {
      setX((prev) => (prev - delta * 0.03) % -window.innerWidth);
    }
  });

  return (
    <motion.section
      className="bg-gradient-to-b from-white to-yellow-50 py-16 px-4 overflow-hidden will-change-transform"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      viewport={{ amount: 0.25 }}
    >
      {/* Heading */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ amount: 0.4 }}
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Our Tech Sponsors
        </h2>
        <p className="text-gray-600">
          Proudly supported by leading platforms and technology innovators
        </p>
      </motion.div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex gap-10 items-center whitespace-nowrap"
        >
          {[...sponsors, ...sponsors].map((sponsor, index) => (
            <motion.a
              key={index}
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="flex flex-col items-center justify-center w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 flex-shrink-0"
            >
              <motion.div
                whileHover={{
                  scale: 1.12,
                  boxShadow: "0px 10px 25px rgba(255, 230, 100, 0.7)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="bg-white rounded-2xl overflow-hidden flex flex-col items-center justify-center 
                           w-full h-full transition-all duration-300"
              >
                <div className="flex items-center justify-center w-full h-3/5">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-w-[70%] max-h-[70%] object-contain"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 text-center mt-3">
                  {sponsor.name}
                </p>
              </motion.div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SponsorSection;
