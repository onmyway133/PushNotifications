npx electron-packager . "PushNotificationTester" --app-bundle-id=com.onmyway133.PushNotifications --helper-bundle-id=com.onmyway133.PushNotifications.helper --app-version=1.4.0 --build-version=1.0.100 --platform=mas --arch=x64 --icon=Icon/Icon.icns --overwrite
npx electron-osx-sign "PushNotificationTester-mas-x64/PushNotificationTester.app" --verbose
npx electron-osx-flat "PushNotificationTester-mas-x64/PushNotificationTester.app" --verbose
