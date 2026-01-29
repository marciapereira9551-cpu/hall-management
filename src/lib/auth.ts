import { supabase } from './supabase'

// Simple PIN hashing (use bcrypt in production!)
const hashPIN = (pin: string): string => {
  // This is a simplified version. Use proper bcrypt in production!
  return btoa(pin + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export const authenticateUser = async (username: string, pin: string) => {
  try {
    const hashedPin = hashPIN(pin)
    
    // Check user in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('pin_hash', hashedPin)
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      return { success: false, error: 'Invalid credentials' }
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
    
    // Log activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'LOGIN',
        details: 'User logged in successfully'
      })
    
    return { success: true, user }
  } catch (error) {
    return { success: false, error: 'Authentication failed' }
  }
}

export const logoutUser = async (userId: string) => {
  // Log logout activity
  await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action: 'LOGOUT',
      details: 'User logged out'
    })
}
