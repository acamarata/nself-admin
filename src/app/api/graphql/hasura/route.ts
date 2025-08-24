import { NextRequest, NextResponse } from 'next/server'

const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql'
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'myadminsecretkey'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'metadata'
    
    switch (action) {
      case 'metadata':
        return await getMetadata()
      case 'schema':
        return await getSchema()
      case 'tables':
        return await getTables()
      case 'permissions':
        return await getPermissions()
      case 'relationships':
        return await getRelationships()
      case 'stats':
        return await getStats()
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Hasura API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Hasura operation failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, variables, action } = body
    
    if (action === 'execute') {
      return await executeGraphQL(query, variables)
    } else if (action === 'introspect') {
      return await introspectSchema()
    } else if (action === 'metadata') {
      return await updateMetadata(body.metadata)
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Hasura POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Hasura operation failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

async function getMetadata() {
  try {
    const response = await fetch(`${HASURA_ENDPOINT.replace('/v1/graphql', '/v1/metadata')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        type: 'export_metadata',
        args: {}
      })
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: {
        metadata: data,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    throw error
  }
}

async function getSchema() {
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          kind
          description
          fields {
            name
            type {
              name
              kind
            }
          }
        }
        queryType {
          name
        }
        mutationType {
          name
        }
        subscriptionType {
          name
        }
      }
    }
  `
  
  try {
    const response = await fetch(HASURA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        query: introspectionQuery
      })
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: {
        schema: data.data.__schema,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    throw error
  }
}

async function getTables() {
  const query = `
    query GetTables {
      information_schema_tables(
        where: { table_schema: { _eq: "public" } }
      ) {
        table_name
        table_schema
        table_type
      }
    }
  `
  
  try {
    const response = await fetch(HASURA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({ query })
    })
    
    const data = await response.json()
    
    const tablesData = data.data?.information_schema_tables || []
    
    const detailedTables = await Promise.all(
      tablesData.map(async (table: any) => {
        const columnsQuery = `
          query GetColumns {
            information_schema_columns(
              where: { 
                table_schema: { _eq: "public" },
                table_name: { _eq: "${table.table_name}" }
              }
            ) {
              column_name
              data_type
              is_nullable
              column_default
            }
          }
        `
        
        const colResponse = await fetch(HASURA_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
          },
          body: JSON.stringify({ query: columnsQuery })
        })
        
        const colData = await colResponse.json()
        
        return {
          ...table,
          columns: colData.data?.information_schema_columns || []
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      data: {
        tables: detailedTables,
        count: detailedTables.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    throw error
  }
}

async function getPermissions() {
  try {
    const response = await fetch(`${HASURA_ENDPOINT.replace('/v1/graphql', '/v1/metadata')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        type: 'export_metadata',
        args: {}
      })
    })
    
    const data = await response.json()
    
    const permissions = data.sources?.[0]?.tables?.flatMap((table: any) => {
      const tablePermissions = []
      
      ;['select', 'insert', 'update', 'delete'].forEach(action => {
        const perms = table[`${action}_permissions`] || []
        perms.forEach((perm: any) => {
          tablePermissions.push({
            table: table.table.name,
            schema: table.table.schema,
            role: perm.role,
            action: action,
            permissions: perm.permission
          })
        })
      })
      
      return tablePermissions
    }) || []
    
    return NextResponse.json({
      success: true,
      data: {
        permissions,
        count: permissions.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    throw error
  }
}

async function getRelationships() {
  try {
    const response = await fetch(`${HASURA_ENDPOINT.replace('/v1/graphql', '/v1/metadata')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        type: 'export_metadata',
        args: {}
      })
    })
    
    const data = await response.json()
    
    const relationships = data.sources?.[0]?.tables?.flatMap((table: any) => {
      const tableRelationships = []
      
      const objectRels = table.object_relationships || []
      const arrayRels = table.array_relationships || []
      
      objectRels.forEach((rel: any) => {
        tableRelationships.push({
          table: table.table.name,
          schema: table.table.schema,
          name: rel.name,
          type: 'object',
          using: rel.using
        })
      })
      
      arrayRels.forEach((rel: any) => {
        tableRelationships.push({
          table: table.table.name,
          schema: table.table.schema,
          name: rel.name,
          type: 'array',
          using: rel.using
        })
      })
      
      return tableRelationships
    }) || []
    
    return NextResponse.json({
      success: true,
      data: {
        relationships,
        count: relationships.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    throw error
  }
}

async function getStats() {
  try {
    const [metadata, schema] = await Promise.all([
      getMetadata(),
      getSchema()
    ])
    
    const metadataData = await metadata.json()
    const schemaData = await schema.json()
    
    const tables = metadataData.data?.metadata?.sources?.[0]?.tables || []
    const types = schemaData.data?.schema?.types || []
    
    const stats = {
      tables: tables.length,
      customTypes: types.filter((t: any) => !t.name.startsWith('__')).length,
      queryFields: types.find((t: any) => t.name === 'query_root')?.fields?.length || 0,
      mutationFields: types.find((t: any) => t.name === 'mutation_root')?.fields?.length || 0,
      subscriptionFields: types.find((t: any) => t.name === 'subscription_root')?.fields?.length || 0,
      roles: [...new Set(tables.flatMap((t: any) => {
        const permissions = []
        ;['select', 'insert', 'update', 'delete'].forEach(action => {
          const perms = t[`${action}_permissions`] || []
          perms.forEach((p: any) => permissions.push(p.role))
        })
        return permissions
      }))].length,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    throw error
  }
}

async function executeGraphQL(query: string, variables?: any) {
  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query is required' },
      { status: 400 }
    )
  }
  
  try {
    const response = await fetch(HASURA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        query,
        variables: variables || {}
      })
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: {
        result: data,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    throw error
  }
}

async function introspectSchema() {
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          description
          locations
          args {
            ...InputValue
          }
        }
      }
    }
    
    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }
    
    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
    }
    
    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `
  
  return executeGraphQL(introspectionQuery)
}

async function updateMetadata(metadata: any) {
  if (!metadata) {
    return NextResponse.json(
      { success: false, error: 'Metadata is required' },
      { status: 400 }
    )
  }
  
  try {
    const response = await fetch(`${HASURA_ENDPOINT.replace('/v1/graphql', '/v1/metadata')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        type: 'replace_metadata',
        args: metadata
      })
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: {
        result: data,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    throw error
  }
}