# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Folder Structure

```text
.
├── app/                 # Expo Router routes (File-based routing)
│   ├── (onboarding)/    # Onboarding flow routes (A3-A14)
│   ├── (public)/        # Public routes (A0-A2: Welcome, Login)
│   ├── (tabs)/          # Main app navigation tabs (Home, Diary, Meal Plan, Account)
│   ├── _layout.tsx      # Root layout and providers
│   ├── quick-add.tsx    # Quick action modal
│   └── webview.tsx      # WebView container
├── assets/              # Images, fonts, and static resources
└── src/                 # Application source code
    ├── components/      # Reusable UI components organized by domain
    │   ├── buttons/     # Custom buttons (GradientButton, etc.)
    │   ├── layout/      # Layout components (ScreenBackground, SafeScreen)
    │   └── ...          # Feature-specific shared components
    ├── domain/          # Business logic (calculators, validators, models)
    ├── features/        # Screen containers and feature-specific logic
    │   ├── auth/
    │   ├── onboarding/
    │   ├── diary/
    │   └── ...
    ├── i18n/            # Internationalization (multi-language support)
    ├── mocks/           # Mock data for development and testing
    ├── store/           # State management (Zustand)
    ├── theme/           # Design system (tokens, colors, typography)
    ├── types/           # TypeScript interfaces and contracts
    └── utils/           # Helper functions and formatting
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
