# smsss-phone
React-Native for smsss

## how to build
 1. Generate SHA1 certificate fingerprints [read more here](http://stackoverflow.com/questions/15727912/sha-1-fingerprint-of-keystore-certificate)
 2. Register [firebase](https://firebase.google.com/) and download firebase config file, then put it in /android/app
 3. build by using these commands
 
`cd android`

`gradlew.bat assembleRelease`

`cd app/build/outputs/apk`

`zipalign -v 4 app-release-unaligned.apk SMSSS.apk`

## How to run debug
Install react-native-cli following [this](https://facebook.github.io/react-native/) and run by using this command
`react-native run-android`


## Config
if you would like to change the server, go to /config.js and change backendUrl constant