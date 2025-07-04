# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your RealPNL project.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `realpnl-auth`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set Up Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4. Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**`
3. Go to **Authentication** → **Providers**
4. Enable **Email** provider
5. Configure email templates (optional)

### 5. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Try creating a new account with:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`

4. Check your email for verification (if enabled)

## 🔧 Advanced Configuration

### Email Verification

To require email verification:

1. Go to **Authentication** → **Settings**
2. Enable **Enable email confirmations**
3. Customize email templates in **Authentication** → **Templates**

### Social Authentication

To add Google, GitHub, or other providers:

1. Go to **Authentication** → **Providers**
2. Enable your desired provider
3. Configure OAuth credentials
4. Update redirect URLs

### Custom User Metadata

The system automatically stores:
- `full_name` from signup form
- `email` from authentication
- `created_at` and `updated_at` timestamps

## 🛡️ Security Features

### Row Level Security (RLS)
- Users can only access their own profile data
- Automatic policy enforcement
- Secure by default

### Session Management
- JWT tokens for authentication
- Automatic token refresh
- Secure session storage

### Password Security
- Supabase handles password hashing
- Minimum 6 character requirement
- Secure password validation

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Ensure `.env` file is in project root
   - Restart development server after adding variables

2. **CORS Errors**
   - Add your domain to Supabase allowed origins
   - Check redirect URLs configuration

3. **Email Not Sending**
   - Verify email provider settings
   - Check spam folder
   - Configure SMTP settings if needed

4. **Profile Not Created**
   - Check database trigger function
   - Verify RLS policies
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```typescript
// In src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true
  }
});
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [React Auth Patterns](https://supabase.com/docs/guides/auth/auth-patterns)

## 🔄 Migration from Demo Auth

The new Supabase auth system replaces the demo authentication:

- ✅ Real user accounts with email verification
- ✅ Secure password storage
- ✅ Session persistence
- ✅ Database integration
- ✅ Production-ready security

Your existing demo users will need to create new accounts with Supabase. 