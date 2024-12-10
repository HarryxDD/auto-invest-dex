# AutoDEX: Decentralized Automated Investment Mobile Application

AutoDEX is a decentralized application (DApp) designed to provide automated investment solutions on decentralized exchanges (DEX). The platform allows users to set up investment strategies and execute them seamlessly without relying on centralized platforms.

## Features
- **Automated Investment Plans**: Users can set up recurring investment plans with custom rules and strategies.
- **Wallet Integration**: Supports Metamask and other wallet connections via WalletConnect.
- **Real-Time Notifications**: Users receive alerts about executed trades and plan updates.
- **Analytics Dashboard**: Monitor investment performance over time.


## Technologies Used
- **Mobile**: React Native for building the mobile interface.
- **Backend**: NestJS for API and business logic.
- **Smart Contract**: Solidity for smart contract development.
- **Database**: MongoDB for storing user data and transaction history.
- **Notifications**: Firebase Cloud Messaging (FCM) for push notifications.


## Setup and Installation

### Prerequisites
Before you begin, ensure you have the following installed on your system:
1. **Smart Contract**
    - Node.js and npm installed
    - Hardhat for smart contract development and testing
    - MetaMask or any Ethereum wallet for interacting with the dApp
   
2. **Backend**
    - Node.js and npm installed
    - NestJS framework for building the backend
    - MongoDB for the NoSQL database
    - TypeScript for better development experience and type checking
    - Postman or similar tool for testing APIs
   
3. **Mobile Application**
    - Node.js and npm installed
     - React Native CLI for creating and managing the mobile app
     - Android Studio and Xcode for Android and iOS development, respectively
       - Set up Android Development Environment:
         - Install Android Studio
         - Set Up Android SDK
         - Configure Environment Variables
       - Set up iOS Development Environment (macOS only):
         - Install Xcode
         - Install Xcode Command Line Tools
         - Install CocoaPods


### Installation Steps
#### Smart Contract

1. Install dependencies:
   ```
   
   npm install
   
   ```

2. Compile the Smart Contracts using Hardhat:
   ```
   
   npx hardhat compile
   
   ```
   
3. Operator configuration:
   Config operator address which is the only wallet can trigger DCA (auto swap) strategies
   ```
   
   /contract/scripts/deploy.avaxc.ts
    await Registry.grantRole(
          await Registry.OPERATOR(),
          “AAA” // Only this address can make dca trading
    )
   
   ```

4. Deploy the Smart Contracts:
   ```
   
   npx hardhat run scripts/deploy.js --network <network_name>
   
   ```

5. Run Tests:
   ```
   
   npx hardhat test
   
   ```

#### Backend

1. Install dependencies:
   ```
   
   npm install
   
   ```

2. Run Docker services:
   ```
   
   docker compose -f ./caching-docker-compose.yml up
   
   ```

3. Run the Main application:
   ```
   
   npm run start
   
   ```

4. Run the Worker:
   ```
   
   npm run start:worker
   
   ```

#### Mobile Application

1. Install dependencies:
   ```
   
   yarn
   
   ```

2. Install CocoaPods dependencies (iOS only):
   ```
   
   cd ios
   pod install
   cd ..
   
   ```

3. Run the application:
   **For Android:**
   To open an Android emulator and install the app:
   ```
   
   yarn android
   
   ```
   
   Start Metro:
   ```
   
   yarn start
   
   ```

   **For iOS:**
   Open the iOS project in Xcode, click Build Icon to start the simulator, and install the app:
   ```
   
   open ios/AutoDex.xcworkspace
   
   ```
   
   Start Metro:
   ```
   
   yarn start
   
   ```

## Usage
1. Open the app and log in using your credentials.
2. Connect your wallet via Metamask or WalletConnect.
3. Create an investment plan by selecting tokens, target DEX, and execution rules.
4. Monitor your investment plans in real-time and receive notifications for all executed trades.


## Contributors
- Truong Ha Vu  
- Pham Van Thinh  


## Contact
For inquiries or contributions, please reach out via [harrytruong1772@gmail.com].
