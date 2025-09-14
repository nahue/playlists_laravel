# Spotify API Setup

This application can automatically fetch song metadata from Spotify when adding songs to playlists.

## Setup Instructions

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: Your app name (e.g., "Playlist Manager")
   - **App description**: Brief description of your app
   - **Website**: Your website URL (can be localhost for development)
   - **Redirect URI**: `http://localhost:8000` (for development)
   - **API/SDKs**: Check "Web API"
5. Click "Save"

### 2. Get Your Credentials

1. In your app dashboard, click on your app
2. Note down your **Client ID** and **Client Secret**
3. These will be used in your `.env` file

### 3. Configure Environment Variables

Add these lines to your `.env` file:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### 4. Usage

Once configured, users can:

1. **Add songs manually** by filling out the form fields
2. **Add songs via Spotify URL** by:
   - Pasting a Spotify track URL (e.g., `https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh`)
   - Clicking the "Load" button to automatically fetch metadata
   - The form will be populated with title, artist, album, and duration
   - Users can still edit any field before saving

### Supported URL Formats

The app supports these Spotify URL formats:
- `https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh`
- `spotify:track:4iV5W9uYEdYUVa79Axb7Rh`

### Features

- **Automatic metadata fetching**: Title, artist, album, duration
- **Fallback support**: If Spotify API fails, users can still add songs manually
- **Visual indicators**: Spotify links show with a green music icon
- **Error handling**: Graceful handling of invalid URLs or API failures

### Rate Limits

Spotify's Web API has rate limits. The app uses client credentials flow which has higher limits suitable for this use case.

### Troubleshooting

- **"Invalid Spotify URL format"**: Make sure the URL is a valid Spotify track URL
- **"Could not fetch metadata from Spotify"**: Check your API credentials and internet connection
- **API errors**: Check the Laravel logs for detailed error messages
