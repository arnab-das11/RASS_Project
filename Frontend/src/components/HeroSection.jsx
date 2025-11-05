import { motion } from "framer-motion";

const Sahitya = new URL("../assets/sahitya.png", import.meta.url).href;
const Rishav = new URL("../assets/rishav.png", import.meta.url).href;
const Arnab = new URL("../assets/arnab.png", import.meta.url).href;
const Soumyadeep = new URL("../assets/bagchi.png", import.meta.url).href;

const mentors = [
  {
    name: "Sahitya Sk",
    occupation: "Senior Web Developer, Microsoft",
    image: Sahitya,
  },
  {
    name: "Rishav Biswas",
    occupation: "AI Researcher, Google DeepMind",
    image: Rishav,
  },
  {
    name: "Arnab Das",
    occupation: "Data Scientist, Amazon",
    image: Arnab,
  },
  {
    name: "Soumyadeep Bagchi Dewan",
    occupation: "Cybersecurity Expert, IBM",
    image: Soumyadeep,
  },
];

const HeroSection = () => {
  return (
    <div className="bg-gray-50 py-14 px-6 md:px-16 lg:px-24">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Meet Our Mentors
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Learn from industry leaders and top professionals guiding the next
          generation of learners.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-center">
        {mentors.map((mentor, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 15 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 aspect-square w-72">
            
            <img
              src={mentor.image}
              alt={mentor.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 pb-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <h2 className="text-xl font-semibold text-white mb-1">
                {mentor.name}
              </h2>
              <p className="text-gray-200 text-sm md:text-base">
                {mentor.occupation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
