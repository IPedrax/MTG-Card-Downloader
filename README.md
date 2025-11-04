# Magic: The Gathering Card Downloader Extension

## 🚀 Overview

Welcome to the **Magic: The Gathering Card Downloader Extension**! This powerful, yet simple, browser extension (Chrome & Firefox) is designed for MTG enthusiasts, content creators, and deck builders who need to quickly and reliably download high-quality card images directly from a deck list.

Tired of manually searching and saving images one by one? This tool automates the entire process, handling complex card formats, double-sided cards, and even providing intelligent fallbacks when set information is missing.

### ✨ Key Features

*   **Intelligent Parsing**: Accepts standard MTG deck list formats, automatically extracting quantity, card name, set code, collector number, and finish (Foil/Etched).
*   **Flexible Input**: Set code and Collector Number are **optional**. If omitted, the extension uses Scryfall's powerful fuzzy search to find the default (most recent/popular) print.
*   **Double-Sided Card Support**: Automatically detects double-sided cards (e.g., MDFCs, Transform cards) and downloads **both faces**, saving them neatly into a dedicated `DS/` folder within the ZIP.
*   **Scryfall API Integration**: Leverages the robust and up-to-date Scryfall API for reliable image retrieval.
*   **Professional UI**: Features a clean, dark-themed interface inspired by popular MTG platforms like Moxfield and Scryfall, with a focus on usability and visual feedback.
*   **Error Reporting**: Provides a clear list of any cards that could not be found, allowing you to download the rest of your list without interruption.
*   **Cross-Browser Compatibility**: Built on Manifest V3 for full compatibility with **Google Chrome** and **Mozilla Firefox**.

### ⚙️ Installation

The extension is available for both Chrome and Firefox.

#### 🦊 Firefox (Recommended)

The extension is officially published on the Mozilla Add-ons store.

*   **Install Directly**: Click here to install from the official store: [MTG Card Downloader on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/mtg-card-downloader/)

#### 🌐 Chrome/Brave/Edge (Manual/Developer Install)

For Chrome-based browsers, you will need to install it manually using the "Load Unpacked" feature.

1.  **Download the Package**: Download the latest complete ZIP package from the releases section (or use the attached file).
2.  **Unzip**: Extract the contents of the ZIP file to a folder on your computer (e.g., `mtg-card-downloader`).
3.  **Open Extensions Page**: Navigate to `chrome://extensions/`
4.  **Enable Developer Mode**: Ensure **Developer Mode** is toggled **ON**.
5.  **Load Extension**:
    *   Click **"Load unpacked"**.
    *   Select the extracted `mtg-card-downloader` folder.

The extension icon (a stylized purple card) should now appear in your browser toolbar.
## 📝 Usage Guide

1.  **Click the Icon**: Click the **Magic: The Gathering Card Downloader** icon in your browser toolbar to open the popup.
2.  **Paste Your Deck List**: Paste your deck list into the text area.
3.  **Click Download**: Click the **"⬇ Download Card Images"** button.
4.  **Wait**: A progress bar will appear, showing the card currently being downloaded. The extension respects Scryfall's rate limits to ensure smooth operation.
5.  **Download ZIP**: Once complete, click the **"📦 Download ZIP File"** button to save your images.

### 💡 Deck List Format

The parser is highly flexible, but the core format is:

`[Quantity] [Card Name] [(SET) CN] [*F* or *E*]`

| Field | Description | Status | Example |
| :--- | :--- | :--- | :--- |
| **Quantity** | Number of copies of the card. | **Optional** | `4` (Defaults to `1` if omitted) |
| **Card Name** | Full name of the card. Use `/` for double-sided cards. | **Required** | `Lightning Bolt` or `Tribute to Horobi / Echo of Death's Wail` |
| **(SET) CN** | Set code in parentheses and Collector Number. | **Optional** | `(M10) 146` |
| **Finish** | Foil (`*F*`) or Etched (`*E*`) marker. | **Optional** | `*F*` |

**Fallback Logic**: If the `(SET) CN` is missing, the extension will automatically search for the card by name only and download the default print.

**Double-Sided Cards**: If a card is double-sided, both faces will be downloaded and placed in a `DS/` folder inside the ZIP.

## 🤝 Contributing & Support

This project is a labor of love for the MTG community. While I don't actively seek contributions, feel free to fork the repository and adapt it to your needs.

If you encounter any issues, please check the browser's developer console for error messages and open an issue on the GitHub repository with the details.

## 📜 License & Attribution

This extension is provided as-is under the MIT License.

**Data and Images**: All card data and images are provided by the fantastic team at [Scryfall](https://scryfall.com). This product is not produced by, endorsed by, supported by, or affiliated with Wizards of the Coast.

---
*Built with passion for Magic: The Gathering.*
*Version 2.0.0*
*Last Updated: November 2025*
