# YouTube API Setup

This application can automatically search YouTube and fetch video URLs when adding songs to playlists.

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Log in with your Google account
3. Click "Select a project" → "New Project"
4. Fill in the project details:
    - **Project name**: Your project name (e.g., "Playlist Manager")
    - **Organization**: Select your organization (optional)
    - **Location**: Select a location for your project
5. Click "Create"

### 2. Enable YouTube Data API v3

1. In your Google Cloud project, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on "YouTube Data API v3"
4. Click "Enable"

### 3. Create API Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional) Click "Restrict Key" to limit usage:
    - **Application restrictions**: HTTP referrers
    - **API restrictions**: Select "YouTube Data API v3"

### 4. Configure Environment Variables

Add this line to your `.env` file:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 5. Usage

Once configured, users can:

1. **Add songs manually** by filling out the form fields
2. **Search YouTube for songs** by:
    - Filling in the song title and artist
    - Clicking the "Search" button in the YouTube search section
    - Selecting from the displayed video results
    - The YouTube URL will be automatically filled in the "Other URL" field

### Search Features

The YouTube search functionality includes:

- **Smart search queries**: Automatically combines song title and artist
- **Visual results**: Shows video thumbnails, titles, and channel names
- **Click-to-select**: Easy selection of the best matching video
- **Top 5 results**: Displays the most relevant results for quick selection
- **Keyboard support**: Press Enter in the search field to search

### Supported Search Queries

The app automatically creates search queries by combining:

- Song title + Artist name
- Example: "Bohemian Rhapsody Queen" → searches for "Bohemian Rhapsody Queen"

### Features

- **Automatic URL generation**: Creates proper YouTube watch URLs
- **Visual selection**: Thumbnail previews make it easy to choose the right video
- **Fallback support**: If YouTube search fails, users can still add songs manually
- **Loading states**: Clear feedback during search operations
- **Error handling**: Graceful handling of API failures or no results

### Rate Limits

YouTube Data API v3 has the following limits:

- **Quota cost**: 100 units per search request
- **Daily quota**: 10,000 units (default)
- **Requests per day**: ~100 searches per day (default quota)

### Quota Management

To increase your quota:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Quotas"
3. Search for "YouTube Data API v3"
4. Click "Edit Quotas" and request an increase

### Troubleshooting

- **"YouTube API key not configured"**: Make sure `YOUTUBE_API_KEY` is set in your `.env` file
- **"YouTube API error"**: Check your API key and ensure YouTube Data API v3 is enabled
- **"Failed to search YouTube"**: Check your internet connection and API quota
- **No results found**: Try different search terms or check if the song exists on YouTube
- **API errors**: Check the Laravel logs for detailed error messages

### Security Best Practices

1. **Restrict your API key** to specific domains/IPs in production
2. **Monitor usage** in Google Cloud Console
3. **Set up billing alerts** to avoid unexpected charges
4. **Use environment variables** to keep your API key secure
5. **Never commit API keys** to version control

### Example Usage

1. **Add a new song** to your playlist
2. **Fill in the title**: "Bohemian Rhapsody"
3. **Fill in the artist**: "Queen"
4. **Click "Search"** in the YouTube search section
5. **Select the best result** from the displayed videos
6. **The URL field** will be automatically filled with the YouTube link
7. **Complete the form** and add the song

### Integration Benefits

- **Faster song addition**: No need to manually search YouTube
- **Accurate URLs**: Ensures correct YouTube links
- **Visual confirmation**: See the actual video before adding
- **Better user experience**: Streamlined workflow for playlist creation
