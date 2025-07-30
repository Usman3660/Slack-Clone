# TeamChat - Slack Clone

TeamChat is a modern, real-time team collaboration tool inspired by Slack. It provides a platform for users to communicate through channels, send direct messages, and share information seamlessly. This application is built using the MERN stack (MongoDB, Express.js, React, Node.js) with Next.js for the frontend, offering a robust and scalable solution for team communication.

## 🚀 Features

*   **User Authentication**: Secure user registration and login with JWT-based authentication.
*   **Channel Management**:
    *   Create public channels for team discussions.
    *   Join and leave channels.
    *   Browse available channels.
    *   Delete channels (only by the creator).
*   **Real-time Messaging**:
    *   Send and receive messages in real-time within channels using Socket.IO.
    *   Messages are persisted in a MongoDB database.
*   **Typing Indicators**: See when other users are actively typing in a channel, enhancing real-time interaction.
*   **Responsive UI**: A clean and intuitive user interface built with Tailwind CSS and Shadcn/ui components, ensuring a great experience across devices.
*   **MongoDB Integration**: Persistent storage for users, channels, and messages.

## 🛠️ Technologies Used

**Frontend:**
*   **Next.js 14 (App Router)**: React framework for building server-rendered React applications.
*   **React**: JavaScript library for building user interfaces.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
*   **Shadcn/ui**: Reusable UI components built with Radix UI and Tailwind CSS.
*   **Socket.IO Client**: For real-time, bidirectional communication.
*   **date-fns**: For date formatting and manipulation.

**Backend:**
*   **Node.js**: JavaScript runtime environment.
*   **Express.js (Implicitly via Next.js API Routes)**: For handling API endpoints.
*   **MongoDB**: NoSQL database for data storage.
*   **Mongoose (Implicitly via MongoDB Driver)**: MongoDB object modeling for Node.js.
*   **bcryptjs**: For password hashing and security.
*   **jsonwebtoken**: For generating and verifying JWTs for authentication.
*   **Socket.IO**: For real-time, event-based communication.

**Database:**
*   **MongoDB Atlas / Local MongoDB**: Cloud-hosted or local MongoDB instance.

## ⚙️ Setup and Installation

Follow these steps to get your TeamChat application up and running locally.

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd teamchat-slack-clone
\`\`\`

### 2. Install Dependencies

Navigate to the project root and install both client and server dependencies:

\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables. Replace the placeholder values with your actual credentials.

**Important Notes for `MONGODB_URI`:**
*   If your MongoDB password contains special characters like `@`, make sure to **URL-encode** them. For example, `usman@1122` becomes `usman%401122`.
*   Ensure your MongoDB user has the necessary permissions (read and write) to the specified database.

\`\`\`env
# MongoDB Connection String
# IMPORTANT: Replace this with your actual MongoDB URI.
# The '@' in your password 'usman@1122' must be URL-encoded as '%40'.
MONGODB_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/slack?retryWrites=true&w=majority

# JWT Secret Key (generate a secure random string)
# You can generate a strong secret using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key

# Next.js Environment
NODE_ENV=development

# Public URL for your Next.js app (used by Socket.IO client for CORS)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Port for the standalone Socket.IO server
SOCKET_PORT=3001
\`\`\`

### 4. MongoDB Setup (Schema and Seed Data)

You need to set up your MongoDB database with the necessary collections and some initial data.

1.  **Connect to your MongoDB instance** (e.g., using MongoDB Compass, MongoDB Shell, or Atlas UI).
2.  **Run the SQL scripts** provided in the `scripts/` directory. These scripts define the schema and insert sample data.

    *   `scripts/database-schema.sql`: Creates the `users`, `channels`, `channel_members`, and `messages` collections and their indexes.
    *   `scripts/seed-data.sql`: Inserts sample users, channels, and messages.

    **Note**: These are SQL-like scripts for conceptual schema and data. For MongoDB, you would typically use MongoDB shell commands or a tool like MongoDB Compass to create collections and insert data. The `scripts/mongodb-setup.js` file is a JavaScript script that can be run directly in the MongoDB shell or Compass to set up the database and seed data.

    **To run `scripts/mongodb-setup.js` in MongoDB Shell:**
    \`\`\`bash
    mongo <your-mongodb-connection-string> scripts/mongodb-setup.js
    \`\`\`
    (Replace `<your-mongodb-connection-string>` with your actual URI, ensuring it includes the database name, e.g., `mongodb://localhost:27017/slack` or your Atlas URI.)

### 5. Run the Application

TeamChat requires two separate processes to run: the Next.js frontend/API and the standalone Socket.IO server.

1.  **Start the Next.js Development Server:**
    In your first terminal, navigate to the project root and run:
    \`\`\`bash
    npm run dev
    \`\`\`
    This will start the Next.js application, typically on `http://localhost:3000`.

2.  **Start the Socket.IO Server:**
    In a **separate terminal**, navigate to the project root and run the standalone Socket.IO server:
    \`\`\`bash
    node socket-server.js
    \`\`\`
    You should see a message like "Socket.IO server listening on port 3001".

Once both servers are running, open your browser and navigate to `http://localhost:3000`.

## 📂 Project Structure

\`\`\`
teamchat-slack-clone/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── channels/
│   │   │   ├── [id]/
│   │   │   │   ├── join/route.ts
│   │   │   │   ├── leave/route.ts
│   │   │   │   └── messages/route.ts
│   │   │   ├── joined/route.ts
│   │   │   └── route.ts
│   │   ├── messages/route.ts
│   │   └── socket/route.ts (Placeholder, Socket.IO server is separate)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── chat-area.tsx
│   │   ├── sidebar.tsx
│   │   └── welcome-screen.tsx
│   └── ui/ (Shadcn/ui components)
├── contexts/
│   ├── auth-context.tsx
│   └── chat-context.tsx
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   ├── Channel.ts
│   │   ├── Message.ts
│   │   └── User.ts
│   └── mongodb.ts
├── scripts/
│   ├── database-schema.sql
│   ├── mongodb-setup.js
│   └── seed-data.sql
├── socket-server.js (Standalone Socket.IO server)
├── .env.local.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
\`\`\`

## 💡 Future Enhancements (Incomplete Tasks)

*   **File Uploads**: Implement functionality to share files within channels.
*   **User Mentions**: Allow users to mention specific team members in messages using `@username`.
*   **Message Reactions**: Enable users to react to messages with emojis.
*   **Admin Dashboard**: Create an administrative interface for managing users, channels, and application settings.
*   **Direct Messaging**: Implement one-on-one private conversations between users.
*   **User Profiles**: Allow users to view and edit their profiles.
*   **Search Functionality**: Add the ability to search messages and channels.
*   **Notifications**: Implement desktop or in-app notifications for new messages or mentions.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
