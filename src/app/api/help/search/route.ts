import { helpArticles, helpSearchIndex } from '@/data/help-content'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter "q" is required',
        },
        { status: 400 },
      )
    }

    // Search using FlexSearch
    let results = helpSearchIndex.search(query, limit * 2)

    // Filter by category if specified
    if (category) {
      results = results.filter((article) => article.category === category)
    }

    // Limit results
    results = results.slice(0, limit)

    // Calculate relevance scores and add highlights
    const enhancedResults = results.map((article) => {
      const titleMatch = article.title
        .toLowerCase()
        .includes(query.toLowerCase())
      const descMatch = article.description
        .toLowerCase()
        .includes(query.toLowerCase())

      let relevance = article.popularity
      if (titleMatch) relevance += 50
      if (descMatch) relevance += 25

      return {
        ...article,
        relevance,
        highlight: getHighlight(article.content, query),
      }
    })

    // Sort by relevance
    enhancedResults.sort((a, b) => b.relevance - a.relevance)

    // Generate "Did you mean?" suggestions
    const suggestions = generateSuggestions(query, results)

    return NextResponse.json({
      success: true,
      query,
      results: enhancedResults,
      total: enhancedResults.length,
      suggestions,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

function getHighlight(content: string, query: string, length = 200): string {
  const lowerContent = content.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerContent.indexOf(lowerQuery)

  if (index === -1) {
    return content.slice(0, length) + '...'
  }

  const start = Math.max(0, index - 50)
  const end = Math.min(content.length, index + query.length + length - 50)

  let highlight = content.slice(start, end)
  if (start > 0) highlight = '...' + highlight
  if (end < content.length) highlight = highlight + '...'

  return highlight
}

function generateSuggestions(query: string, results: unknown[]): string[] {
  if (results.length > 0) return []

  const commonMisspellings: Record<string, string> = {
    postgress: 'postgres',
    hasurra: 'hasura',
    deployement: 'deployment',
    databse: 'database',
    backp: 'backup',
    migratoin: 'migration',
  }

  const lowerQuery = query.toLowerCase()
  const suggestions: string[] = []

  // Check for common misspellings
  for (const [wrong, correct] of Object.entries(commonMisspellings)) {
    if (lowerQuery.includes(wrong)) {
      suggestions.push(lowerQuery.replace(wrong, correct))
    }
  }

  // Check for partial matches in article titles
  const partialMatches = helpArticles
    .filter((article) => {
      const title = article.title.toLowerCase()
      const words = lowerQuery.split(' ')
      return words.some((word) => title.includes(word))
    })
    .slice(0, 3)

  partialMatches.forEach((article) => {
    const title = article.title.toLowerCase()
    if (!suggestions.includes(title)) {
      suggestions.push(title)
    }
  })

  return suggestions.slice(0, 3)
}
