# Adobe Bridge MapView

A Google Maps based extension for Adobe Bridge for geotagging photos and showing their location on an interactive map.

## Prerequisites

You need to generate your personal Google Cloud API key to use the extension. You need to set billing information etc., but worry not, the Google Maps Platform gives generous monthly [free quota](https://developers.google.com/maps/billing-and-pricing/billing#monthly-credit), so you will practically never have to pay real money to use this extension, if you don't share your API key with others. (small print: nevertheless l take no responsibility if you somehow manage to exceed your free quota. Set a usage limit if worried).

1. [Create a Google Cloud project](https://developers.google.com/maps/documentation/javascript/cloud-setup)
   - [Enable](https://developers.google.com/maps/documentation/javascript/cloud-setup#enabling-apis) `Maps JavaScript API` and `Places API` for the project
2. [Generate an API key](https://developers.google.com/maps/documentation/javascript/get-api-key)
   - Copy the generated key

3. Since this extension is not packaged or signed, it can only be used with [debug mode](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/Documentation/CEP%2010.0%20HTML%20Extension%20Cookbook.md#debugging-unsigned-extensions) enabled

## Installation

1. Clone the repository or download as a zip
2. Copy the `MapViewCEP` to any of the [extension folders](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/Documentation/CEP%2010.0%20HTML%20Extension%20Cookbook.md#extension-folders)
   - It has been reported that only the per-user folders work, so I suggest trying that first. E.g. for Windows `C:\Users\<USERNAME>\AppData\Roaming\Adobe\CEP\extensions`
3. Copy the `nativeEventForwarder.jsx` script to the Startup Scripts folder of Bridge. You can find the path from Edit → Preferences → Startup Scripts → Reveal My Startup Scripts
4. (Re)start Bridge
5. Open extension from Window → Extensions → MapView

## Usage

#### Save API key

When you first launch the extension, you will be asked to enter your API key. If it works, the map will launch and the key will be saved in the extension's userdata folder. If it does not work (wrong key, insufficient permissions for the key), the API key will be asked again.

#### Geotagging

Click anywhere on the map to set a marker, and click `Save location to EXIF`. The marker location will be saved to the EXIF metadata (`GPSLatitude` and `GPSLongitude`) of all selected items that support EXIF metadata, in degrees and decimal minutes format `(DDD,MM.mmmmmmk)`.

#### Color themes

Map color themes can be changed in `MapViewCEP/client/mapStyles.js`. There are four styles, one for every Bridge's global interface theme. You can make your own styles with online tools like https://mapstyle.withgoogle.com/ and just replace any of the 4 style arrays with a new one. For example, if you use the darkest available Bridge interface, modify the `mapStyleDarkest` array.


## Screenshots

<img src="https://github.com/stuomas/bridge-map-view/blob/main/screenshot.jpg?raw=true" width=400>

## Development

Tested only on Bridge 2021/2022/2023 for Windows. If you have bugs to report or features to request, please do! Pull requests are also welcome.

- - - -

<p align="center" style="text-align:center"><a href="https://www.buymeacoffee.com/stuomas"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" width=170></a></p>
