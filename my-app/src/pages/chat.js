"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaPause, FaHome } from "react-icons/fa";

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSeverity, setCurrentSeverity] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);

  // 카테고리 분류를 위한 키워드 매핑
  const categoryKeywords = {
    "정신건강": ["우울", "불안", "스트레스", "자살", "죽고싶다", "힘들다", "괴롭다", "무기력", "절망", "고민"],
    "가족관계": ["부모", "가족", "엄마", "아빠", "형제", "자매", "가정", "부모님", "가족관계"],
    "학교생활": ["학교", "공부", "시험", "친구", "선생님", "학업", "성적", "등교", "수업", "동급생"],
    "대인관계": ["친구", "사람", "관계", "소통", "외톨이", "왕따", "따돌림", "인간관계", "사교"],
    "진로": ["진로", "직업", "꿈", "미래", "직장", "취업", "전공", "학과", "직업선택"],
    "연애": ["연애", "사랑", "남자친구", "여자친구", "이별", "연인", "데이트", "고백"],
    "성": ["성", "성교육", "성적", "임신", "피임", "성관계", "성적지향"],
    "인터넷/스마트폰": ["인터넷", "스마트폰", "게임", "SNS", "유튜브", "온라인", "디지털", "중독"],
    "폭력": ["폭력", "폭행", "학폭", "가정폭력", "성폭력", "따돌림", "왕따", "폭언"],
    "성격": ["성격", "자신감", "자존감", "소심", "내향적", "외향적", "완벽주의"],
    "학습": ["학습", "공부", "시험", "성적", "학업", "수업", "과제", "숙제"],
    "기타": ["기타", "다른", "그 외", "기타문제"]
  };

  // 키워드 기반 카테고리 분류 함수
  const classifyCategory = (text) => {
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    
    return "기타"; // 기본값
  };

  // 심각도 평가 함수 (키워드 기반)
  const evaluateSeverity = (text) => {
    const lowerText = text.toLowerCase();
    
    // 위험 키워드 (심각도 5)
    const dangerKeywords = ["자살", "죽고싶다", "죽을까봐", "죽이고싶다", "끝내고싶다"];
    for (const keyword of dangerKeywords) {
      if (lowerText.includes(keyword)) {
        return 5;
      }
    }
    
    // 고위험 키워드 (심각도 4)
    const highRiskKeywords = ["힘들다", "괴롭다", "절망", "무기력", "의미없다"];
    for (const keyword of highRiskKeywords) {
      if (lowerText.includes(keyword)) {
        return 4;
      }
    }
    
    // 중간 위험 키워드 (심각도 3)
    const mediumRiskKeywords = ["스트레스", "불안", "걱정", "고민", "어려움"];
    for (const keyword of mediumRiskKeywords) {
      if (lowerText.includes(keyword)) {
        return 3;
      }
    }
    
    // 낮은 위험 키워드 (심각도 2)
    const lowRiskKeywords = ["조금", "가끔", "생각", "고민"];
    for (const keyword of lowRiskKeywords) {
      if (lowerText.includes(keyword)) {
        return 2;
      }
    }
    
    return 1; // 기본 심각도
  };

  // 상담 기법 선택 함수
  const selectCounselingTechnique = (category, severity) => {
    if (severity >= 4) {
      return "위기 개입 기법";
    } else if (category === "정신건강" && severity >= 3) {
      return "인지행동치료 기법";
    } else if (category === "가족관계" || category === "대인관계") {
      return "가족치료 및 의사소통 기법";
    } else {
      return "공감적 경청 및 지지적 상담 기법";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('STT 처리 실패');
      }

      const { text } = await response.json();
      
      // 사용자 메시지 추가
      const userMessage = {
        id: Date.now(),
        text: text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // 카테고리 분류
      const category = classifyCategory(text);
      const severity = evaluateSeverity(text);
      const technique = selectCounselingTechnique(category, severity);
      
      setCurrentCategory(category);
      setCurrentSeverity(severity);

      // AI 응답 생성
      await generateAIResponse(text, category, severity, technique);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('음성 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (userText, category, severity, technique) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          category: category,
          severity: severity,
          technique: technique,
          conversationHistory: messages.slice(-5) // 최근 5개 메시지만 전송
        }),
      });

      if (!response.ok) {
        throw new Error('AI 응답 생성 실패');
      }

      const { aiResponse, audioUrl } = await response.json();

      // AI 메시지 추가
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        category: category,
        severity: severity,
        technique: technique
      };

      setMessages(prev => [...prev, aiMessage]);

      // TTS 재생
      if (audioUrl) {
        playTTS(audioUrl);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      alert('AI 응답 생성 중 오류가 발생했습니다.');
    }
  };

  const playTTS = (audioUrl) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    
    audio.play();
    setIsPlaying(true);
    setCurrentAudio(audio);
  };

  const stopTTS = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaHome size={20} />
          <span className="font-medium">홈으로</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">정신건강 케어 상담</h1>
          {currentCategory && (
            <p className="text-sm text-gray-600">
              분류: {currentCategory} | 심각도: {currentSeverity}/5
            </p>
          )}
        </div>
        
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <div className="mb-4">
              <Image
                src="/images/pobby.png"
                alt="상담 로봇"
                width={100}
                height={100}
                className="mx-auto rounded-full"
              />
            </div>
            <p className="text-lg">안녕하세요! 무엇이든 편하게 말씀해 주세요.</p>
            <p className="text-sm mt-2">마이크 버튼을 눌러 음성으로 대화하세요.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              
              {message.sender === 'ai' && message.category && (
                <div className="mt-2 text-xs opacity-60">
                  <p>분류: {message.category}</p>
                  <p>심각도: {message.severity}/5</p>
                  <p>기법: {message.technique}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">상담사가 응답을 준비하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white shadow-lg p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Recording Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-4 rounded-full transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
          </button>

          {/* TTS Control */}
          {currentAudio && (
            <button
              onClick={isPlaying ? stopTTS : () => playTTS(currentAudio.src)}
              className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
            >
              {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
            </button>
          )}
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {isRecording ? '녹음 중... (다시 클릭하여 중지)' : '마이크를 눌러 음성으로 대화하세요'}
          </p>
        </div>
      </div>
    </div>
  );
}