import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { message, category, severity, technique, conversationHistory } = await request.json();

    // 공공데이터 기반 상담 프롬프트 구성
    const systemPrompt = `당신은 한국청소년상담복지개발원의 전문 상담사입니다. 
    
현재 상담 상황:
- 문제 분류: ${category}
- 심각도: ${severity}/5
- 적용 기법: ${technique}

상담 원칙:
1. 공감적 경청과 지지적 태도를 유지하세요
2. 심각도에 따라 적절한 개입을 하세요
3. 위기 상황(심각도 4-5)에서는 즉시 전문기관 연계를 권고하세요
4. 한국어로 자연스럽게 대화하세요
5. 전문적이면서도 따뜻한 톤을 유지하세요

심각도별 대응:
- 심각도 1-2: 일반적인 상담과 지지
- 심각도 3: 더 적극적인 개입과 모니터링
- 심각도 4-5: 위기 개입 및 전문기관 연계 권고

응답은 2-3문장으로 간결하게 작성하세요.`;

    // 대화 히스토리 구성
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // GPT-4 응답 생성
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // TTS 생성 (ElevenLabs API 직접 호출)
    let audioUrl = null;
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: aiResponse,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        });

        if (ttsResponse.ok) {
          const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
          const audioBase64 = audioBuffer.toString('base64');
          audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
        }
      } catch (error) {
        console.error('TTS Error:', error);
      }
    }

    return NextResponse.json({
      aiResponse,
      audioUrl
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: '상담 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 