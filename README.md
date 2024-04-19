# Pokemon Cafe Bot

This is a bot designed to automate the reservation process for the Pokemon Cafe in Tokyo and Osaka.

## Overview

The Pokemon Cafe Bot is built using Puppeteer, a Node library which provides a high-level API to control headless Chrome or Chromium. It automates the process of navigating to the Pokemon Cafe reservation page, selecting the number of guests, choosing a date and time slot, and making the reservation.

## Installation

To use the Pokemon Cafe Bot, you'll need to have Node.js installed on your system. Then, you can install the dependencies using npm:

```bash
npm install
```

## Configuration
Before running the bot, make sure to configure the options in the index.ts file:

- `location`: Specify the location of the Pokemon Cafe (Tokyo or Osaka).
- `numberOfGuests`: Specify the number of guests for the reservation.

```typescript
const pokemonCafeOptions: PokemonCafeOptions = {
    location: PokemonCafeLocation.Tokyo,
    numberOfGuests: 6,
};
```

## Usage

To start the bot, run the following command

```bash
npm start
```
The bot will launch a headless browser and begin the reservation process. Follow the instructions in the console to complete the reservation.

## Contributing

Contributions are welcome! If you encounter any issues or have ideas for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the ISC License