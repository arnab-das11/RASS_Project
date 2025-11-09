import { motion } from "framer-motion";
import { Star } from "lucide-react";

const feedbacks = [
  {
    name: "Aarav Mehta",
    role: "Learner",
    image: "https://randomuser.me/api/portraits/men/42.jpg",
    comment:
      "The AI course was incredibly well-structured. The mentors were supportive and the platform made learning fun and engaging!",
    rating: 4.5,
  },
  {
    name: "Sneha Kapoor",
    role: "Instructor",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    comment:
      "As an instructor, I love how easy it is to manage and interact with students. The dashboard is intuitive and efficient.",
    rating: 5,
  },
  {
    name: "Rohit Sharma",
    role: "Learner",
    image: "https://randomuser.me/api/portraits/men/19.jpg",
    comment:
      "I've gained real-world skills from the web development track. The projects are hands-on and truly industry-ready.",
    rating: 4,
  },
  {
    name: "Aditya Verma",
    role: "Learner",
    image: "https://randomuser.me/api/portraits/men/29.jpg",
    comment:
      "Excellent support team and engaging content! I wish there were more advanced modules on AI though.",
    rating: 3.5,
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
              className="w-5 h-5 text-yellow-400 fill-yellow-400 absolute left-0 top-0"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
            <Star className="w-5 h-5 text-yellow-400/30 fill-yellow-400/30" />
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 mt-1">{rating}</span>
    </div>
  );
};

const FeedbackSection = () => {
  return (
    <div className="bg-gradient-to-b from-white to-green-50 py-16 px-6 md:px-16 lg:px-24">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Feedback from Our Community
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Hear what our learners and instructors have to say about their journey with us.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-center">
        {feedbacks.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm 
                       hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]
                       p-6 w-80 sm:w-96 flex flex-col items-center text-center 
                       transition-shadow duration-300">
            
            <img src={item.image} alt={item.name}
              className="w-20 h-20 object-cover rounded-full border-4 border-blue-500 mb-4"/>

            <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
            <p className="text-blue-600 text-sm mb-2">{item.role}</p>
            <StarRating rating={item.rating} />
            <p className="text-gray-600 text-sm md:text-base leading-relaxed italic border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              “{item.comment}”
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackSection;

