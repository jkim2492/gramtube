# GramTube

Unofficial telegram client for browsing videos. Available at https://gramtube.com

Made with Angular 19

This project is still in alpha and has many bugs. Please open issues when you spot one!

## Setup

This application requires an API id from Telegram to function. [Documentation](https://core.telegram.org/api/obtaining_api_id#obtaining-api-id)

Copy `src/config.ts.example` to `src/config.ts` and replace the dummy `API_ID` and `API_HASH` with your own credentials

## Development server

To start a local development server, run:

```bash
npm run serve
```

On top of `ng serve`, this will reload the server upon modifying the service worker

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Todo

- Show updates from subscription on home page
- Better session storage management
- Advanced search queries
- Dark theme

## Credits

This project uses [gramjs](https://github.com/gram-js/gramjs) for interacting with Telegram
