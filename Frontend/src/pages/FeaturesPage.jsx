import { useNavigate } from "react-router-dom";
import { Brain, Trophy, Laptop, UserCheck, Target, Cloud, Globe, MessageSquare } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: <Brain className="w-10 h-10 text-blue-600" />,
    title: "AI Learning Assistant",
    desc: "Get real-time support and explanations powered by AI, helping you understand concepts faster and solve coding problems efficiently.",
  },
  {
    icon: <Trophy className="w-10 h-10 text-yellow-500" />,
    title: "Gamified Learning",
    desc: "Earn points, badges, and ranks as you complete modules — making learning exciting, fun, and goal-driven.",
  },
  {
    icon: <Laptop className="w-10 h-10 text-green-600" />,
    title: "Virtual Coding Labs",
    desc: "Practice programming directly in your browser with real-time compilers and project-based exercises.",
  },
  {
    icon: <UserCheck className="w-10 h-10 text-purple-600" />,
    title: "Personalized Dashboard",
    desc: "Track your learning progress, set study goals, and get tailored recommendations based on your performance.",
  },
  {
    icon: <Target className="w-10 h-10 text-red-600" />,
    title: "Career Roadmap",
    desc: "Follow step-by-step career pathways to become a developer, data scientist, or AI engineer with curated resources.",
  },
  {
    icon: <Cloud className="w-10 h-10 text-cyan-500" />,
    title: "Cloud-Based Learning",
    desc: "Access your courses, code, and progress anytime, anywhere — all securely stored in the cloud.",
  },
  {
    icon: <Globe className="w-10 h-10 text-indigo-600" />,
    title: "Global Community",
    desc: "Join a thriving learner community, participate in hackathons, and collaborate on open-source projects.",
  },
  {
    icon: <MessageSquare className="w-10 h-10 text-orange-500" />,
    title: "Interactive Discussion Forums",
    desc: "Engage in topic-based discussions, share ideas, and get guidance from mentors and peers worldwide.",
  },
];

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col relative">

      <div className="flex-grow pt-16 md:pt-24 pb-16 px-6 md:px-20">
        <Navbar />
      </div>

      <div className="text-center pt-20 pb-10 px-6 md:px-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Innovative Features That Empower Learning
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the tools and technologies that make our platform a next-generation
          learning experience for students, instructors, and lifelong learners.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6 md:px-20 pb-16 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div key={index}
            className="bg-white shadow-md rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-xl transition-all hover:bg-green-100 duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>

      <footer className="w-full bg-gray-800 text-white mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default FeaturesPage;

