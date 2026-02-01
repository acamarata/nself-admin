import { executeNselfCommand } from '@/lib/nselfCLI'
import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          details: 'A logo file is required',
        },
        { status: 400 },
      )
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'uploads', 'logos')
    await mkdir(uploadDir, { recursive: true })

    const filename = `${id}-${Date.now()}${path.extname(file.name)}`
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Call nself CLI to update branding
    const result = await executeNselfCommand('tenant', [
      'branding',
      'logo',
      `--tenant=${id}`,
      `--file=${filepath}`,
    ])

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update logo',
          details: result.error || result.stderr || 'Unknown error',
        },
        { status: 500 },
      )
    }

    const logoUrl = `/uploads/logos/${filename}`

    return NextResponse.json({
      success: true,
      data: { logoUrl },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update logo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
