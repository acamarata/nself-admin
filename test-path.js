// Test the project path resolution
const projectPath = process.env.NSELF_PROJECT_PATH || process.env.PROJECT_PATH || '.backend'

console.log('Raw path:', projectPath)

if (!projectPath.startsWith('/')) {
  if (projectPath.startsWith('../')) {
    console.log('Resolved path:', `/Users/admin/Sites/${projectPath.substring(3)}`)
  } else {
    console.log('Resolved path:', `/Users/admin/Sites/nself-admin/${projectPath}`)
  }
} else {
  console.log('Absolute path:', projectPath)
}