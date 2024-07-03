# Server Tracker

The Server Tracker is a web application that allows users to track Minecraft servers.

## Local Development

To build the Server Tracker, follow these steps:

Highly recommended to install [Bun](https://bun.sh/) for the package management.

1. Clone the repository:

   ```bash
   git clone https://github.com/Rishon/Server-Tracker
   ```

### Client

2. Install the dependencies:

   ```bash
    cd Server-Tracker/client
    bun install
   ```

3. Adjust the environment variables:

   ```yml
   NEXT_PUBLIC_API_URL=<API URL>
   NEXT_PUBLIC_HOSTNAME=<Hostname>
   ```

4. Start the development Next.JS server:

   ```bash
    bun dev
   ```

### Server

4. Install the dependencies:

   ```bash
    cd Server-Tracker/server
    bun install
   ```

5. Assign the environment variables:

   ```bash
    cp .env.example .env
   ```

6. Adjust the environment variables:

   ```yml
   BACKEND_PORT=<Port>
   MONGODB_URL=<MongoDB URI>
   ```

7. Start the development server:

   ```bash
    bun dev
   ```

## Production

To deploy the Server Tracker, follow these steps:

1. Build the Next.JS application:

   ```bash
    cd Server-Tracker/client
    bun run build
   ```

2. Run the docker-compose file:

   ```bash
    cd Server-Tracker
    docker-compose up -d
   ```

## Issues

If you discover a bug, please open up an [issue](https://github.com/Rishon/Server-Tracker/issues/new).

## Contributing

To contribute to the Server Tracker, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`.
4. Push to the branch: `git push origin <branch>`.
5. Create the pull request.
