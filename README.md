# 🎮 Killer Game - Real-Life Assassination Game API

A real-world assassination game platform built with **NestJS**, **TypeORM**, **WebSockets**, **Redis**, and **MySQL**. Players use GPS coordinates and real-world interactions to hunt their assigned targets.

## 🎯 Game Overview

**Killer Game** is an outdoor game of strategy, stealth, and social interaction where players must "assassinate" their assigned targets by claiming a personal item from them in real life. The twist? Both players must be honest about the kill for it to count!

### How It Works

1. **Game Creation** - A player creates a new game and invites others (minimum 4 players to start)
2. **Player Assignment** - When the game starts, players are randomly assigned targets in a circular kill chain
3. **Real-Life Hunt** - Players track their target's location using GPS coordinates shared through the app
4. **The Kill** - To eliminate your target, you must:
   - Get within **50 meters** of their location (proximity alert via WebSocket)
   - Take **any personal item** from them in real life (pen, coat, keychain, etc.)
   - Have them **confirm the kill** through the app (proof of honesty)
5. **Target Inheritance** - When you successfully kill someone, you inherit:
   - Their assigned target as your new target
   - All their accumulated kills added to your kill count
6. **Victory** - Last player alive wins the game!

## 🔑 Key Features

- **Real-Time WebSocket Updates**
  - Game start/finish notifications to all players
  - Target proximity alerts (< 50 meters)
  - Real-time location tracking
  
- **Circular Kill Chain**
  - Dynamic target reassignment after each kill
  - Automatic target reassignment if a chain is broken
  - Kill inheritance system

- **GPS-Based Gameplay**
  - Location tracking with Haversine distance formula
  - 50-meter proximity threshold for kill notifications
  
- **Game Management**
  - Multiple concurrent games
  - Three game states: WAITING, RUNNING, FINISHED
  - Persistent game history with leaderboards
  
- **Player Management**
  - Per-game unique nicknames
  - Secret codes for kill verification
  - Kill statistics and leaderboards
  - Both game-specific and standalone players

- **Security**
  - Basic authentication for Swagger API documentation
  - Docker containerization with health checks
  - Redis for caching and real-time data

## 📋 Requirements

- **Node.js** v22+
- **Docker & Docker Compose**
- **MySQL** 8.0+
- **Redis** 7+

## 🚀 Quick Start

### Option 1: Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start services (MySQL & Redis)
docker-compose up -d

# Run development server
npm run start:dev
```

### Option 2: Docker (Recommended)

```bash
# Start entire stack
docker-compose up -d --build

# Access Swagger UI
# URL: http://localhost:3001/api
# Credentials: admin / admin123
```

The application will be available at:
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api (requires Basic Auth)
- **WebSocket**: ws://localhost:3001

## 🔧 Environment Variables

```env
DB_HOST=database
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
PORT=3000
REDIS_HOST=redis
REDIS_PORT=
SWAGGER_USER=
SWAGGER_PASSWORD=
```

## 📚 API Endpoints

### Games
- `POST /games` - Create a new game
- `GET /games` - List all games
- `GET /games/:id` - Get game details
- `POST /games/:id/start` - Start a game
- `POST /games/:id/finish` - Finish a game
- `DELETE /games/:id` - Delete a game
- `GET /games/:id/result` - Get game result with winner

### Players
- `POST /players` - Create standalone player
- `GET /players` - List all players
- `POST /games/:gameId/players` - Add player to game
- `GET /games/:gameId/players` - Get game players
- `GET /games/:gameId/players/alive` - Get alive players
- `GET /games/:gameId/players/leaderboard` - Get leaderboard
- `PUT /games/:gameId/players/:playerId/location` - Update player location
- `POST /games/:gameId/players/assign-targets` - Assign initial targets
- `POST /games/:gameId/players/:playerId/kill` - Kill a player (with secret code)
- `PATCH /games/:gameId/players/:playerId/nickname` - Change nickname

### WebSocket Events

**Subscribe (Listen)**
- `gameStarted` - Game has started
- `gameFinished` - Game finished, winner announced
- `targetAlert` - Your target is within 50 meters
- `distanceUpdate` - Distance to your target

**Emit (Send)**
- `joinGame` - Join a game room
- `updateLocation` - Send location update
- `respondToKill` - Confirm or deny a kill attempt

## 🏗️ Project Structure

```
src/
├── game/
│   ├── game.controller.ts      # Game endpoints
│   ├── game.service.ts         # Game business logic
│   ├── game.gateway.ts         # WebSocket handlers
│   ├── game.entity.ts          # Game database entity
│   └── game.module.ts          # Game module
├── player/
│   ├── player.controller.ts    # Player endpoints
│   ├── player.service.ts       # Player business logic
│   ├── player.entity.ts        # Player database entity
│   └── player.module.ts        # Player module
├── app.module.ts               # Root module
└── main.ts                     # App bootstrap
```

## 🗄️ Database Schema

### Games Table
- `id` - Primary key
- `code` - Unique game code
- `status` - WAITING | RUNNING | FINISHED
- `createdAt` - Game creation timestamp
- `startedAt` - Game start timestamp
- `finishedAt` - Game finish timestamp
- `winner` - Reference to winning player

### Players Table
- `id` - Primary key
- `nickname` - Per-game unique nickname
- `secretCode` - For kill verification
- `isAlive` - Current alive status
- `kills` - Kill count
- `currentTarget` - Assigned target player
- `latitude` / `longitude` - GPS coordinates
- `lastLocationUpdate` - Last location update timestamp
- `game` - Reference to game


## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Kill Chain Algorithm

When a player dies, the system automatically:
1. Finds who was hunting the dead player
2. Reassigns their target to the next alive player in the chain
3. Prevents circular references and dead targets
4. Marks dead player's target as null

## 🛑 Project setup

```bash
$ npm install
```

## 🏃 Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🧪 Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```


