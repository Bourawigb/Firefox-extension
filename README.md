# Trackers Blocker Firefox Extension

## Overview

The Trackers Blocker is a Firefox extension designed to enhance user privacy by blocking tracking scripts and monitoring fingerprinting attempts. It utilizes entropy-based methods to determine the risk of data collection from web pages and allows users to set thresholds for blocking scripts based on their entropy values.

## Features

- **Entropy Threshold Control**: Users can set a threshold to determine how aggressively the extension blocks tracking scripts.
- **Random Profile Generation**: The extension can generate random profiles to minimize the amount of identifiable information shared with websites.
- **Script Monitoring**: Tracks the number of scripts loaded on a webpage and categorizes them as first-party or third-party.
- **Log Downloading**: Users can download logs of fingerprinting attempts for further analysis.

## Installation

To install the Trackers Blocker extension in Firefox, follow these steps:

1. **Clone the Repository**:
   Clone this repository to your local machine using the following command:
   ```bash
   git clone https://github.com/yourusername/trackers-blocker.git
2. **Open Firefox**:
    Launch the Firefox browser.
    Navigate to the Add-ons Debugging Page:
    In the address bar, type about:debugging#/runtime/this-firefox and press Enter.
3. **Load the Extension**:
    Click on the "Load Temporary Add-on" button.
    In the file dialog, navigate to the cloned repository folder and select the manifest.json file. This will load the extension into Firefox temporarily.
4. **Testing the Extension**:
    Once loaded, you should see the extension icon in the toolbar.
    Click the icon to open the extension popup and configure the settings as desired.
    Usage
    Setting the Entropy Threshold: Use the slider in the extension popup to set your desired entropy threshold. The threshold determines how aggressively the extension blocks scripts based on their entropy values.
***Random Profile***: Click the "Random Profile" button to apply a random profile to your browser, which helps in reducing tracking.
***Block Collection***: Use the "Block collection" button to enable or disable tracking script blocking.
***Download Logs***: Click the "Download Logs" button to save a text file containing logs of fingerprinting attempts.
Contributing
Contributions are welcome! If you have suggestions for improvements or new features, feel free to create an issue or submit a pull request.