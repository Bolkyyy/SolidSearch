// test.js - простой тест без TypeScript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iufzexibjyajleprlpip.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1ZnpleGlianlhamxlcHJscGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjkxMTgsImV4cCI6MjA5MDcwNTExOH0.QrCqqbN-uthSjin1_ExMGug76oAiFF87qeHq7KDiOpU';

console.log('🔍 Testing Supabase connection...');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Key exists:', supabaseKey ? 'Yes' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Пробуем получить список таблиц
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('✅ SUCCESS! Connected to Supabase');
      console.log('ℹ️  Table "users" not found, but connection works');
      console.log('🎉 Your backend can use Supabase!');
    } else if (error) {
      console.log('⚠️  Connection error:', error.message);
    } else {
      console.log('✅ SUCCESS! Connected to Supabase');
      console.log('🎉 Everything is working!');
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();