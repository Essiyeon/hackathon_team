"use client";

import { useEffect } from "react";
import Image from "next/image";

const difficultyLevels = {
  low: { label: "초보자", icon: "😊", description: "차근차근 설명하고 많은 도움을 드립니다." },
  middle: { label: "일반", icon: "😐", description: "일반적인 상담 수준으로 진행됩니다." },
  high: { label: "전문가", icon: "🧠", description: "더 깊이 있는 상담과 전문적인 조언을 제공합니다." }
};

const CategoryModal = ({ isOpen, onClose, selectedCategory, onSelectDifficulty }) => {
  // 키보드 ESC를 눌러 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const getCategoryLabel = () => {
    const categories = {
      "mental_health": "정신건강 상담",
      "interpersonal": "대인관계 상담",
      "academic_career": "학업/진로 상담",
      "violence_victim": "폭력피해 상담",
      "dependency_addiction": "중독/과의존 상담",
      "school_dropout": "학교중단 상담",
      "outside_home": "가정밖 상담",
      "violence_perpetrator_delinquency": "폭력가해/비행 상담",
      "sexuality": "성 상담",
      "labor_work": "노동/근로 상담",
      "deficiency_poverty": "결핍/빈곤 상담",
      "physical_health_perception": "신체건강 상담",
      "migration_background": "이주배경 상담"
    };
    return categories[selectedCategory] || selectedCategory;
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn"
      onClick={(e) => {
        // Click outside to close
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 rounded-xl shadow-2xl w-[90%] max-w-md text-center relative animate-scaleIn">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">상담 수준 선택</h2>
        <p className="text-gray-600 mb-6">
          {getCategoryLabel()}에 맞는 상담 수준을 선택해주세요
        </p>

        <div className="grid grid-cols-1 gap-4 mb-4">
          {Object.entries(difficultyLevels).map(([level, { label, icon, description }]) => (
            <button
              key={level}
              className="bg-white border-2 border-gray-300 p-4 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center text-left"
              onClick={() => onSelectDifficulty(level)}
            >
              <div className="text-3xl mr-4">{icon}</div>
              <div>
                <div className="font-bold text-lg">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CategoryModal;