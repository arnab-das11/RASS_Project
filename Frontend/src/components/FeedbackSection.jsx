import { motion } from "framer-motion";
import { Star } from "lucide-react";

const feedbacks = [
  {
    name: "Elliott Douthett",
    role: "Learner",
    image: "Elliott-Douthett.jpg",
    comment:
      "The AI course was incredibly well-structured. The mentors were supportive and the platform made learning fun and engaging!",
    rating: 4.5,
  },
  {
    name: "Prof. John Lennox",
    role: "Instructor",
    image: "john_lennox.jpg",
    comment:
      "As an instructor, I love how easy it is to manage and interact with students. The dashboard is intuitive and efficient.",
    rating: 5,
  },
  {
    name: "Dyah Pritadrajati",
    role: "Learner",
    image: "dyah_pritadrajati.jpg",
    comment:
      "I've gained real-world skills from the web development track. The projects are hands-on and truly industry-ready.",
    rating: 4,
  },
  {
    name: "Prof. Elleke Boehmer",
    role: "Instructor",
    image: "elleke_boehmer.jpg",
    comment:
      "Excellent support team and engaging content! I wish there were more advanced modules on AI though.",
    rating: 4.5,
  },
];

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex flex-col items-center mb-3">
      <div className="flex justify-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative w-5 h-5">
            <Star
              className="w-5 h-5 text-yellow-400 fill-yellow-400 absolute inset-0"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
            <Star className="w-5 h-5 text-yellow-400/30 fill-yellow-400/30" />
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 mt-1">
        {rating}
      </span>
    </div>
  );
};

/* SAME animation system as other sections */
const containerVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: "easeOut",
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const FeedbackSection = () => {
  return (
    <motion.section
      className="bg-gradient-to-b from-white to-green-50 py-16 px-4 sm:px-8 md:px-12 xl:px-16 will-change-transform"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25 }}
    >
      {/* Heading */}
      <motion.div
        className="text-center mb-12"
        variants={cardVariants}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Feedback from Our Community
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Hear what our learners and instructors have to say about their journey with us.
        </p>
      </motion.div>

      {/* Feedback cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 xl:gap-10 justify-items-center">
        {feedbacks.map((item, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm 
                       hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]
                       p-6 w-full max-w-[360px] flex flex-col items-center text-center 
                       transition-shadow duration-300"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-full border-4 border-blue-500 mb-4"
            />

            <h2 className="text-xl font-semibold text-gray-800">
              {item.name}
            </h2>
            <p className="text-blue-600 text-sm mb-2">
              {item.role}
            </p>

            <StarRating rating={item.rating} />

            <p className="text-gray-600 text-sm md:text-base leading-relaxed italic 
                          border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              “{item.comment}”
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default FeedbackSection;
