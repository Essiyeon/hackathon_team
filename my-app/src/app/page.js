"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Title from "@/component/Title";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation effect when page loads
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
      {/* Title with fade-in animation */}
      <div className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Title>정신건강 케어</Title>
        <p className="text-lg text-blue-600 mb-6 font-extrabold text-2xl drop-shadow-md">
          당신의 마음을 들어드릴게요
        </p>
      </div>

      {/* Logo with enhanced animations */}
      <div 
        className={`mb-8 bg-white p-4 rounded-full shadow-xl transition-all duration-500 
                  ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
                  ${isHovered ? 'scale-105 shadow-2xl' : 'scale-100'}`}
        style={{ 
          transitionDelay: "0.2s",
          transform: isHovered ? "scale(1.05)" : "scale(1)" 
        }} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-full">
          <Image 
            src="/images/pobby.png" 
            alt="정신건강 케어 로고"
            width={280}            
            height={280}
            className="rounded-full"
            priority
          />
          {/* Subtle highlight effect on hover */}
          <div className={`absolute inset-0 bg-white bg-opacity-30 
                          transition-opacity duration-300 rounded-full
                          ${isHovered ? 'opacity-20' : 'opacity-0'}`}>
          </div>
        </div>
      </div>

      {/* Start button with enhanced feedback */}
      <button
        className={`bg-blue-500/90 hover:bg-blue-600 text-white px-10 py-4 rounded-full text-xl
                  font-medium shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5
                  transition-all duration-300 backdrop-blur-sm
                  ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
        style={{ transitionDelay: "0.4s" }}
        onClick={() => router.push("/chat")}
        aria-label="상담 시작하기"
      >
        상담 시작하기
      </button>
    </div>
  );
}