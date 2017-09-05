# ℙ𝕦𝕤𝕙 ℕ𝕠𝕥𝕚𝕗𝕚𝕔𝕒𝕥𝕚𝕠𝕟𝕤

<div align = "center">
<img src="Screenshots/ios.png" height="400"/>
</div>

## Description

- `PushNotitication` is an app used for testing push notifications on iOS and Android
- Support macOS

## How to install

- Download latest release from https://github.com/onmyway133/PushNotifications/releases

## How to use

- [iOS Provider Certificate](#ios-provider-certificates)
- [iOS Authentication Token](#ios-authentication-token)
- [Android Server Key](#android-server-key)

### iOS Provider Certificate

- Read more [Provider Certificates](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html#//apple_ref/doc/uid/TP40008194-CH11-SW1)
- Go to [Member Center](https://developer.apple.com/account/ios/certificate/distribution/create)
- Generate `Apple Push Notification service SSL (Sandbox & Production)`, this is now used for both sandbox and production. Download as `.cer` file
- Double click on `.cer` file to install into `Keychain`, then export it as `.p12` file

<div align = "center">
<img src="Screenshots/Certificate.png" width="600"/>
</div>

- In `PushNotifications`, select `.p12` file, fill out `passphase` if needed, fill out `bundle id`, `device token`, `message`, select `environment`
- `message` must be in json format, see [Creating the Remote Notification Payload](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CreatingtheNotificationPayload.html)

<div align = "center">
<img src="Screenshots/iOSCertificate.png" width="600"/>
</div>

### iOS Authentication Token

- Read more [Authentication Tokens](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html#//apple_ref/doc/uid/TP40008194-CH11-SW1)
- Go to [Member Center](https://developer.apple.com/account/ios/certificate/distribution/create)
- Create a `Key` for push notification. Download as `.p8` file.

<div align = "center">
<img src="Screenshots/Key.png" width="600"/>
</div>

- Note your `key id`

<div align = "center">
<img src="Screenshots/KeyId.png" width="600"/>
</div>

- Note your `team id` on [Account Membership](https://developer.apple.com/account/#/membership)

<div align = "center">
<img src="Screenshots/TeamId.png" width="600"/>
</div>

- In `PushNotifications`, select `.p8` file, fill out `key id`, `team id`, `bundle id`, `device token`, `message`, select `environment`

<div align = "center">
<img src="Screenshots/iOSToken.png" width="600"/>
</div>


### Android Server Key

- Read about [
Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/)
- Add or select project on [Firebase Console](https://console.firebase.google.com/u/0/)

<div align = "center">
<img src="Screenshots/AndroidServerKey.png" width="600"/>
</div>

- In `PushNotifications`, fill out `server key`, `device token`, `message`
- `message` must be in json format

<div align = "center">
<img src="Screenshots/Android.png" width="600"/>
</div>

## Credit

- Icon http://emojione.com/
- Use [node-apn](https://github.com/node-apn/node-apn) under the hood


## Author

Khoa Pham, onmyway133@gmail.com

## License

**PushNotifications** is available under the MIT license. See the [LICENSE](https://github.com/onmyway133/PushNotifications/blob/master/LICENSE.md) file for more info.
