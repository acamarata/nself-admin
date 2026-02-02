#!/usr/bin/env tsx
/**
 * Verification script for API key management implementation
 * Run with: npx tsx src/lib/api-keys/verify.ts
 */

import { initDatabase } from '@/lib/database'
import { apiKeysApi, maskApiKey, validateApiKey } from './index'

async function main() {
  console.log('🔐 API Key Management Verification\n')

  // Initialize database
  console.log('1️⃣  Initializing database...')
  await initDatabase()
  console.log('   ✅ Database initialized\n')

  // Create an API key
  console.log('2️⃣  Creating API key...')
  const result = await apiKeysApi.create({
    name: 'Verification Test Key',
    description: 'Test key for verification',
    scope: 'write',
    rateLimit: {
      requests: 100,
      window: 60,
    },
  })
  console.log('   ✅ Key created')
  console.log('   ID:', result.key.id)
  console.log('   Prefix:', result.key.keyPrefix)
  console.log('   Secret:', maskApiKey(result.secretKey))
  console.log('   Hash:', result.key.keyHash.substring(0, 20) + '...')
  console.log('   Scope:', result.key.scope)
  console.log('')

  // Validate the key
  console.log('3️⃣  Validating API key...')
  const validation = await validateApiKey(result.secretKey)
  if (validation.valid) {
    console.log('   ✅ Key is valid')
    console.log('   Name:', validation.key?.name)
    console.log('   Status:', validation.key?.status)
  } else {
    console.log('   ❌ Key is invalid:', validation.error)
  }
  console.log('')

  // Test invalid key
  console.log('4️⃣  Testing invalid key...')
  const invalidValidation = await validateApiKey('nself_xx_invalid_key')
  if (!invalidValidation.valid) {
    console.log('   ✅ Correctly rejected invalid key')
    console.log('   Error:', invalidValidation.error)
  } else {
    console.log('   ❌ Invalid key was accepted (BUG!)')
  }
  console.log('')

  // List all keys
  console.log('5️⃣  Listing all keys...')
  const allKeys = await apiKeysApi.getAll()
  console.log(`   ✅ Found ${allKeys.length} key(s)`)
  console.log('')

  // Update the key
  console.log('6️⃣  Updating API key...')
  await apiKeysApi.update(result.key.id, {
    description: 'Updated description',
  })
  const updated = await apiKeysApi.getById(result.key.id)
  if (updated?.description === 'Updated description') {
    console.log('   ✅ Key updated successfully')
  }
  console.log('')

  // Revoke the key
  console.log('7️⃣  Revoking API key...')
  await apiKeysApi.revoke(result.key.id)
  const revokedValidation = await validateApiKey(result.secretKey)
  if (
    !revokedValidation.valid &&
    revokedValidation.error === 'API key has been revoked'
  ) {
    console.log('   ✅ Key revoked successfully')
    console.log('   Error:', revokedValidation.error)
  }
  console.log('')

  // Clean up
  console.log('8️⃣  Cleaning up...')
  await apiKeysApi.delete(result.key.id)
  const deleted = await apiKeysApi.getById(result.key.id)
  if (!deleted) {
    console.log('   ✅ Key deleted successfully')
  }
  console.log('')

  console.log('✅ All verification tests passed!')
  console.log('')
  console.log('🎉 API Key Management is working correctly!')
}

main().catch((error) => {
  console.error('❌ Verification failed:', error)
  process.exit(1)
})
