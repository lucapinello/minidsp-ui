# MiniDSP Controller

![MiniDSP Controller Interface](./public/interface.png)

This is a simple web interface to control a MiniDSP device, built using React and based on the API of [minidsp-rs](https://github.com/mrene/minidsp-rs).

## Features
- Control Master Volume, Mute, and Preset selection.
- Adjust output gains for left, right, and subwoofer channels.
- Enable or disable Dirac Live processing.

## Installation and Usage

### Option 1: Run Locally

#### Prerequisites
- Node.js (v18 or later recommended)
- npm, yarn, or pnpm installed

#### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/minidsp-ui.git
   cd minidsp-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

### Option 2: Use Docker

#### Prerequisites
- Docker installed on your machine

#### Steps
1. Run the container:
   ```bash
   docker run -p 3000:3000 lucapinello/minidsp-ui
   ```

2. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Screenshot
The interface of the MiniDSP Controller:

![MiniDSP Controller Interface](./public/interface.png)

## Acknowledgments
- This project is based on the API of [minidsp-rs](https://github.com/mrene/minidsp-rs).
- Built with [Next.js](https://nextjs.org/).

## License
[MIT](./LICENSE)

