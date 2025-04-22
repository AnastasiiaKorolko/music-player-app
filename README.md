# Music Tracks Management App

## Description

This project is a web application for managing music tracks. Users can create, edit, upload, and delete tracks, as well as view a list of tracks with features like filtering, sorting, and searching.

The application is built using **React**, with **React Query** for state and API management. Modals are used for creating and editing tracks, and the app integrates with an API to persist track data.

To enhance the user experience, several UI/UX improvements have been implemented:
- **Debounced search** to limit unnecessary API calls.
- **Scroll-to-header button** for quick navigation to the top.
- **Play all tracks button** to play all tracks in sequence.
- **Visual indicator of the currently playing track** and **real-time playback timer**.
- **Added a custom favicon to improve the visual identity of the application**.
- **Music Playback**: Users can select and listen to different music tracks.
- **"Repeat Track" Button**: Added the ability to repeat a single track continuously. Once the button is pressed, the track will keep playing in a loop until stopped.


## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <project-folder>
npm install
