# Security Guidelines

## Environment Variables

This project uses environment variables to store sensitive information like API keys and database credentials. **NEVER commit these files to version control.**

### Protected Files

The following files contain sensitive data and are excluded from Git:
- `.env.local` (frontend environment variables)
- `server/.env` (backend environment variables)

### Setup Instructions

1. **Frontend Setup**: Copy `.env.example` to `.env.local` and fill in your actual API keys
   ```bash
   cp .env.example .env.local
   ```

2. **Backend Setup**: Copy `server/.env.example` to `server/.env` and fill in your MongoDB connection string
   ```bash
   cp server/.env.example server/.env
   ```

### Required Environment Variables

#### Frontend (`.env.local`)
- `OPENROUTER_API_KEY` - Your OpenRouter API key for AI model access
- `VITE_GEMINI_API_KEY` - Your Google Gemini API key

#### Backend (`server/.env`)
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `PORT` - Server port (default: 5000)

## Security Best Practices

1. **Never share your `.env` files** - These contain secret keys
2. **Rotate API keys regularly** - If a key is accidentally exposed, regenerate it immediately
3. **Use different keys** - Use different API keys for development and production
4. **Check before committing** - Always verify `.env` files are not staged with `git status`

## What to Do If Keys Are Exposed

If you accidentally committed sensitive keys:

1. **Immediately revoke/regenerate** the exposed API keys
2. Remove the sensitive file from Git history:
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.local" --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push to remote (be careful with this):
   ```bash
   git push origin --force --all
   ```
4. Update your local `.env.local` with new keys
5. Inform your team members to pull the changes

## Contact

If you discover a security vulnerability, please report it immediately.
