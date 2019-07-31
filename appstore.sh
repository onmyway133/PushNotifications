npx electron-packager . "Push Notification Tester" --app-bundle-id=com.onmyway133.PushNotifications --helper-bundle-id=com.onmyway133.PushNotifications.helper --app-version=1.4.0 --build-version=1.0.100 --platform=mas --arch=x64 --icon=Icon/Icon.icns --overwrite
npx electron-osx-sign "Push Notification Tester-mas-x64/Push Notification Tester.app" --verbose
npx electron-osx-flat "Push Notification Tester-mas-x64/Push Notification Tester.app" --verbose
