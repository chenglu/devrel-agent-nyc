import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsTtsService } from '@/lib/services'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, format } = body as { text: string, format?: 'mp3' | 'wav' }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const tts = new ElevenLabsTtsService()
    const { base64, contentType } = await tts.synthesizeToBase64(text.slice(0, 5000), format || 'mp3')

    return NextResponse.json({ audioBase64: base64, contentType }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'TTS failed' }, { status: 500 })
  }
}
