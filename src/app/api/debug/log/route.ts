import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, data } = await request.json()
    console.log(
      `[CLIENT DEBUG] ${message}`,
      data ? JSON.stringify(data, null, 2) : '',
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Debug log API error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
