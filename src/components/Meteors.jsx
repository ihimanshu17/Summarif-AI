import React, { useEffect, useState } from "react";

const Meteors = ({ count = 20 }) => {
  const [meteors, setMeteors] = useState([]);

  useEffect(() => {
    const newMeteors = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // random horizontal position
      delay: Math.random() * 5, // staggered start
      duration: 2 + Math.random() * 3, // speed variation
    }));
    setMeteors(newMeteors);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="absolute w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-70 blur-sm"
          style={{
            left: `${meteor.left}%`,
            animation: `fall ${meteor.duration}s linear ${meteor.delay}s infinite`,
          }}
        ></span>
      ))}

      {/* Meteor animation keyframes */}
      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-150%);
            opacity: 1;
          }
          to {
            transform: translateY(150vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Meteors;
