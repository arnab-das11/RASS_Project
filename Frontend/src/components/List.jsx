import React from "react";

const List = () => {
  const cards = [
    {
      title: "Java Course",
      desc: "Learn new skills at your own pace with expert instructors.",
      img: "/Home_Card/java.jpg"
      
    },
    {
      title: "Web Developement using MERN",
      desc: "Access a wide range of study materials and guides.",
      img: "/Home_Card/mern.webp",
    },
    {
      title: "Complete DSA in C++",
      desc: "Interactive sessions with industry experts and mentors.",
      img: "/Home_Card/dsa.png"
    },
    {
      title: "Machine Learning",
      desc: "Get personalized advice to boost your career journey.",
      img: "/Home_Card/ml.png"

    },
  ];

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-10">
        Explore Education Resources
      </h1>
      <div className="pl-4 pr-4 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div key={index}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition" >
            <img src={card.img} alt={card.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2"> {card.title} </h2>
              <p className="text-sm text-gray-600"> {card.desc} </p>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full hover:scale-102 transition">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
