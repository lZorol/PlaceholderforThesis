// OAuth Diagnostic Tool
// Run this to test your OAuth configuration
// Usage: node test-oauth.js

require('dotenv').config();
const { google } = require('googleapis');

console.log('\n========================================');
console.log('🔍 OAUTH CONFIGURATION DIAGNOSTIC');
console.log('========================================\n');

// Test 1: Check environment variables
console.log('📋 Test 1: Environment Variables');
console.log('─────────────────────────────────');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

console.log('CLIENT_ID:', clientId ? `✅ Set (${clientId.substring(0, 20)}...)` : '❌ MISSING');
console.log('CLIENT_SECRET:', clientSecret ? `✅ Set (${clientSecret.substring(0, 10)}...)` : '❌ MISSING');
console.log('REDIRECT_URI:', redirectUri || '❌ MISSING');

if (!clientId || !clientSecret || !redirectUri) {
  console.log('\n❌ ERROR: Missing required environment variables!');
  console.log('Please check your .env file.\n');
  process.exit(1);
}

// Test 2: Check format
console.log('\n📝 Test 2: Format Validation');
console.log('─────────────────────────────────');

let hasErrors = false;

if (!clientId.includes('.apps.googleusercontent.com')) {
  console.log('❌ CLIENT_ID format invalid - should end with .apps.googleusercontent.com');
  hasErrors = true;
} else {
  console.log('✅ CLIENT_ID format looks correct');
}

if (clientSecret.length < 10) {
  console.log('❌ CLIENT_SECRET seems too short');
  hasErrors = true;
} else {
  console.log('✅ CLIENT_SECRET length looks correct');
}

if (!redirectUri.startsWith('http://localhost:3001/api/auth/google/callback')) {
  console.log('❌ REDIRECT_URI should be: http://localhost:3001/api/auth/google/callback');
  console.log('   Current value:', redirectUri);
  hasErrors = true;
} else {
  console.log('✅ REDIRECT_URI format correct');
}

// Test 3: Create OAuth client
console.log('\n🔧 Test 3: OAuth Client Creation');
console.log('─────────────────────────────────');

let oauth2Client;
try {
  oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  console.log('✅ OAuth2 client created successfully');
} catch (error) {
  console.log('❌ Failed to create OAuth2 client:', error.message);
  hasErrors = true;
}

// Test 4: Generate auth URL
console.log('\n🔗 Test 4: Generate Authorization URL');
console.log('─────────────────────────────────');

try {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.file'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    response_type: 'code',
    redirect_uri: redirectUri
  });

  console.log('✅ Auth URL generated successfully');
  console.log('\n📎 Generated URL:');
  console.log(authUrl);
  
  // Parse URL to check parameters
  const url = new URL(authUrl);
  console.log('\n🔍 URL Parameters:');
  console.log('  client_id:', url.searchParams.get('client_id') ? '✅ Present' : '❌ Missing');
  console.log('  redirect_uri:', url.searchParams.get('redirect_uri') ? '✅ Present' : '❌ Missing');
  console.log('  response_type:', url.searchParams.get('response_type') ? '✅ Present' : '❌ Missing');
  console.log('  scope:', url.searchParams.get('scope') ? '✅ Present' : '❌ Missing');

} catch (error) {
  console.log('❌ Failed to generate auth URL:', error.message);
  hasErrors = true;
}

// Final summary
console.log('\n========================================');
if (hasErrors) {
  console.log('❌ DIAGNOSTIC FAILED - Issues detected');
  console.log('========================================\n');
  console.log('🔧 Next Steps:');
  console.log('1. Fix the issues listed above');
  console.log('2. Update your .env file');
  console.log('3. Run this diagnostic again');
  console.log('4. Restart your backend server\n');
  process.exit(1);
} else {
  console.log('✅ DIAGNOSTIC PASSED - Configuration looks good!');
  console.log('========================================\n');
  console.log('🎉 Next Steps:');
  console.log('1. Make sure Google Cloud Console is configured:');
  console.log('   - Redirect URI added: http://localhost:3001/api/auth/google/callback');
  console.log('   - JavaScript origins added: http://localhost:5173, http://localhost:3001');
  console.log('   - Scopes added in OAuth consent screen');
  console.log('   - APIs enabled: Google Drive API, Google People API');
  console.log('2. Wait 5-10 minutes for Google changes to propagate');
  console.log('3. Start your backend: node server.js');
  console.log('4. Test login: http://localhost:5173\n');
  process.exit(0);
}