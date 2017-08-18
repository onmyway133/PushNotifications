fcm-push
========
A Node.JS simple interface to Firebase Cloud Messaging (FCM) for Android and iOS

## Installation

Via [npm][1]:

    $ npm install fcm-push

## Usage

    var FCM = require('fcm-push');

    var serverKey = '';
    var fcm = new FCM(serverKey);

    var message = {
        to: 'registration_token_or_topics', // required fill with device token or topics
        collapse_key: 'your_collapse_key', 
        data: {
            your_custom_data_key: 'your_custom_data_value'
        },
        notification: {
            title: 'Title of your push notification',
            body: 'Body of your push notification'
        }
    };
    
    //callback style
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

    //promise style
    fcm.send(message)
        .then(function(response){
            console.log("Successfully sent with response: ", response);
        })
        .catch(function(err){
            console.log("Something has gone wrong!");
            console.error(err);
        })

See [FCM documentation][2] for details.

## Credits

Written and maintained by [Rasmunandar Rustam][3] & [Oscar Kurniawan][5]
Thanks to Changshin Lee for his great work on [node-gcm][4], cloned and modified from there.

## License

The MIT License

Copyright (c) 2016 Rasmunandar Rustam (nandar.rustam@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[1]: http://github.com/isaacs/npm
[2]: https://firebase.google.com/docs/cloud-messaging
[3]: mailto:nandar.rustam@gmail.com
[4]: https://github.com/h2soft/node-gcm
[5]: https://github.com/misugijunz

## Changelog

1.1.2
- Edit ES6 syntax to standard (by @ans-4175) 
- Fixing #19 "No error on invalid to-token" bug (by @ans-4175)
- Remove unused variables (by @ans-4175)

1.1.1
 - Remove unused dependency

1.1.0
  - Add ability to send topic (by @ans-4175)
  - Multicast, now using promise style bluebirdjs (by @misugijunz)
  - Support callback on promise (by @misugijunz)
  - Fixed NotRegistered bug (credit to Saber-Technologies solution)

1.0.7
  
  - Fixed calling the inherits function before declaring .prototype.send function instead of after (thanks to @dnunes)

1.0.6: 

  - Fixed the length calculation for strings with special UTF-8 characters (ie. german umlauts) which caused FCM errors (by @denisu)

1.0.5:

  - Major yet silly bug fix in index.js

1.0.3:

  - README updated

1.0.1:

  - README added

1.0.0:

  - Initial release
