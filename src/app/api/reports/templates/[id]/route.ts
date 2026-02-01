import * as reportsApi from '@/lib/reports'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/reports/templates/[id] - Get a single template
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const template = await reportsApi.getTemplate(id)

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get template',
      },
      { status: 500 },
    )
  }
}

// PATCH /api/reports/templates/[id] - Update a template
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Check if template exists
    const existing = await reportsApi.getTemplate(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      )
    }

    const template = await reportsApi.updateTemplate(id, {
      name: body.name,
      description: body.description,
      category: body.category,
      dataSource: body.dataSource,
      columns: body.columns,
      defaultFilters: body.defaultFilters,
      defaultSort: body.defaultSort,
      visualization: body.visualization,
      tenantId: body.tenantId,
    })

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update template',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/reports/templates/[id] - Delete a template
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if template exists
    const existing = await reportsApi.getTemplate(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      )
    }

    const deleted = await reportsApi.deleteTemplate(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete template' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete template',
      },
      { status: 500 },
    )
  }
}
