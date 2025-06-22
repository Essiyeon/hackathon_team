import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json(
        { error: '오디오 파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 오디오 파일을 OpenAI Whisper로 전송
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ko", // 한국어로 설정
    });

    return NextResponse.json({
      text: transcription.text
    });

  } catch (error) {
    console.error('STT API Error:', error);
    return NextResponse.json(
      { error: '음성 인식 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
