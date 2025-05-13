# YouTube Dynamic Video Grid

## Overview

YouTube Dynamic Video Grid is a Tampermonkey userscript that enhances the YouTube video grid by dynamically adjusting the number of videos displayed per row based on the browser window's width.
This script ensures a responsive layout, optimizing screen space for a better browsing experience.
The script calculates the optimal number of videos (between 3 and 12) and applies the necessary CSS overrides.

I was encountering one of YouTube's infamous UI issues while browsing on my ultrawide.
This is a script that I use personally, so your mileage may vary; however, you should be able to change it depending on your use case.

> [!WARNING]
> There are no guarantees that this script will remain valid over the long term.
> This script was tested using Firefox and compatibility with other browsers is not guaranteed and may vary.

## Quick Start

1. **Install Tampermonkey**:
   - Install the Tampermonkey extension for your browser:
     - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
     - [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
     - [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
     - [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)

2. **Install the Userscript**:
   - Click the [Install this script](https://github.com/nicholas-fedor/youtube-dynamic-grid/raw/main/youtube-dynamic-grid.user.js) link to add it to Tampermonkey.
   - Tampermonkey will prompt you to install the script; click **Install**.

3. **Use the Script**:
   - Visit [YouTube](https://www.youtube.com/) in your browser.
   - The script will automatically adjust the video grid based on your window size.
   - Resize your browser window to see the grid dynamically adapt.
   - Enable debug logging by appending `?debug=1` to the URL (e.g., `https://www.youtube.com/?debug=1`).

## Features

- **Responsive Grid**: Adjusts the number of videos per row (3 to 12) based on window width.
- **Seamless Integration**: Works on YouTube's main page and other video grid pages.
- **Efficient Updates**: Uses MutationObserver and event listeners for real-time grid adjustments.
- **Fallback Mechanism**: Includes polling and retries to ensure compatibility with YouTube's dynamic loading.

## Installation

- Ensure Tampermonkey is installed in your browser (see Quick Start).
- Install the script directly from the [userscript file](https://github.com/nicholas-fedor/youtube-dynamic-grid/raw/main/youtube-dynamic-grid.user.js).
- Alternatively, copy the contents of `youtube-dynamic-grid.user.js` into a new Tampermonkey script.

## Usage

- The script runs automatically on YouTube pages (`*://www.youtube.com/*` and `*://youtube.com/*`).
- No configuration is required; the grid adjusts based on your browser window's width.
- For optimal performance, avoid running multiple grid-modifying scripts simultaneously.

## Parameters

- `videoWidth`: 340px (thumbnail width, tuned for ~9 items on 3440x1440)
- `margin`: 40px (total left/right margins)
- `gap`: 10px (spacing between thumbnails)

## Limitations

May require parameter adjustments for different monitor sizes. File issues at [support](https://github.com/nicholas-fedor/youtube-dynamic-grid/issues).

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please report issues or suggest features via the [Issues](https://github.com/nicholas-fedor/youtube-dynamic-grid/issues) page.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

## Support

For bugs, questions, or feature requests, please open an issue on the [GitHub Issues page](https://github.com/nicholas-fedor/youtube-dynamic-grid/issues).

## Author

- Nick Fedor ([@nicholas-fedor](https://github.com/nicholas-fedor))
