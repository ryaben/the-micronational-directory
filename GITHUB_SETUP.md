# GitHub Integration Setup

This document explains how to set up GitHub API integration for automatic issue creation when new micronation or organization entries are submitted.

## Overview

When a user submits a new micronation or organization entry, the system creates a GitHub issue containing the entry data. **Firebase is no longer used for new entries** - all submissions go directly to GitHub issues for review. Administrators review the issues and add approved entries to the public JSON files (`public/micronations.json` and `public/organizations.json`).

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Micronational Directory - Issue Creator")
4. Select the following scopes:
   - `repo` (Full control of private repositories) - or if using a public repo, just `public_repo`
5. Click "Generate token"
6. **Important**: Copy the token immediately - you won't be able to see it again

### 2. Configure Environment Variables

Add the following variables to your `.env` file (or create one if it doesn't exist):

```env
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_REPO_OWNER=your_github_username
VITE_GITHUB_REPO_NAME=your_repository_name
```

Example:
```env
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_GITHUB_REPO_OWNER=johndoe
VITE_GITHUB_REPO_NAME=the-micronational-directory
```

### 3. Verify Configuration

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## How It Works

### Issue Creation Process

When a new entry is submitted:

1. The entry data is formatted for the JSON file structure
2. A GitHub issue is automatically created with:
   - **Title**: "New micronation submission: [Name]" or "New organization submission: [Name]"
   - **Labels**: `micronation` or `organization`, `new-entry`, `review-required`
   - **Body**: Contains the complete entry data in JSON format (ready to paste into the JSON file), along with submitter information

**Note**: Firebase is no longer used for new entry submissions. All data goes directly to GitHub issues.

### Review Process

Administrators should:

1. Review the GitHub issue
2. **If a flag/logo file was included:**
   - The file is provided as base64-encoded data in the issue
   - Decode the base64 data to get the PNG file
   - Save it to the appropriate folder:
     - Micronations → `public/images/flags/[name].png`
     - Organizations → `public/images/logos/[name].png`
   - Tools to decode base64: online decoders or command line tools
3. Verify the information (websites, social media, etc.)
4. If approved, add the entry to the appropriate JSON file:
   - Micronations → `public/micronations.json`
   - Organizations → `public/organizations.json`
5. Set `approved: true` in the JSON file
6. Close the GitHub issue

#### Handling Large Files

If the base64 data is truncated (marked with "... (truncated)"), the file may be too large for the GitHub issue body. In this case:
- Contact the submitter to request the file directly
- Or ask them to host it externally and provide a URL instead

### Issue Body Format

The issue body includes:

**With file upload:**
```markdown
## New Micronation Submission

A new micronation has been submitted for review. Please review the data below and add it to the corresponding JSON file if approved.

### ⚠️ Flag/Logo File Included

A flag file was uploaded. Please save it to the repository:

1. Download the base64-encoded image below
2. Decode it to get the PNG file
3. Save it as `public/images/flags/Example.png`
4. The JSON data below already references this path

**File name:** `Example.png`
**Base64 data:**
```
iVBORw0KGgoAAAANSUhEUgAA...
```

### Entry Data (JSON format)

```json
{
  "name": {
    "main": "Example",
    "mainAlt": "Example Alt",
    "title": "Principality of",
    "titleAlt": ""
  },
  "flag": "/images/flags/Example.png",
  "motto": "In God we trust",
  "type": ["Physical", "Digital"],
  "languages": ["English"],
  "capital": "Example City",
  "currency": "Example Dollar",
  "foundationDate": { "_seconds": 1234567890 },
  "location": { "_latitude": 0, "_longitude": 0 },
  "memberships": ["Organization Name"],
  "contactInfo": ["email@example.com"],
  "websites": ["https://example.com"],
  "approved": false
}
```

### Submitted by
- Name: John Doe
- Email: john@example.com

### Action Required
1. Review the submitted data
2. If a file was included, save it to the appropriate folder as instructed above
3. Verify the information (websites, social media, etc.)
4. If approved, add the entry to `public/micronations.json`
5. Set `approved: true` in the JSON file
6. Close this issue
```

**With external URL:**
```markdown
## New Micronation Submission

A new micronation has been submitted for review. Please review the data below and add it to the corresponding JSON file if approved.

### Entry Data (JSON format)

```json
{
  "name": {
    "main": "Example",
    "mainAlt": "Example Alt",
    "title": "Principality of",
    "titleAlt": ""
  },
  "flag": "https://example.com/flag.png",
  "motto": "In God we trust",
  "type": ["Physical", "Digital"],
  "languages": ["English"],
  "capital": "Example City",
  "currency": "Example Dollar",
  "foundationDate": { "_seconds": 1234567890 },
  "location": { "_latitude": 0, "_longitude": 0 },
  "memberships": ["Organization Name"],
  "contactInfo": ["email@example.com"],
  "websites": ["https://example.com"],
  "approved": false
}
```

### Submitted by
- Name: John Doe
- Email: john@example.com

### Action Required
1. Review the submitted data
2. If a file was included, save it to the appropriate folder as instructed above
3. Verify the information (websites, social media, etc.)
4. If approved, add the entry to `public/micronations.json`
5. Set `approved: true` in the JSON file
6. Close this issue
```

## Troubleshooting

### GitHub API Errors

If you see errors in the console related to GitHub:

1. **"GitHub credentials not configured"**: Check that all three environment variables are set correctly
2. **"GitHub API error: Bad credentials"**: Your token may be invalid or expired. Generate a new one
3. **"GitHub API error: Not Found"**: Check that the repo owner and repo name are correct

### Issue Creation Fails

If the issue creation fails:
- No data will be saved (neither Firebase nor GitHub)
- Check the browser console for error messages
- Verify your GitHub token has the correct permissions
- Ensure the repository exists and you have write access
- Verify all environment variables are set correctly

### File Upload Issues

If flag/logo file uploads fail:
- Ensure the file is a valid PNG image
- Check browser console for FileReader errors
- Consider using an external URL instead if the file is very large
- GitHub issues have size limits; large files may be truncated

## Security Notes

- **Never commit your `.env` file** to version control
- The `.env.example` file shows the required variables without actual values
- GitHub tokens should be treated as passwords
- Use the minimum required permissions for your token
- Consider using a GitHub App instead of a personal access token for production environments

## Additional Resources

- [GitHub Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
