# Authentication Service
A robust authentication service built with Express.js and Firebase, providing secure user authentication and management capabilities.
## Features
- User registration with email and username
- Secure login with JWT authentication
- Password hashing using bcrypt
- Token-based authentication middleware
- User profile management
- Token refresh functionality
- Protected routes for authenticated users
- Comprehensive error handling
- Request logging middleware
## Prerequisites
Before running this project, make sure you have:
- Node.js (v12 or higher)
- Firebase account and project setup
- MongoDB (if using mongoose)
- Environment variables properly configured
## Installation
1. Clone the repository:
```bash
git clone [your-repository-url]
cd [your-project-name]
```
2. Install dependencies:
```bash
npm install
```
3. Set up your environment variables in a `.env` file:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
```
4. Configure Firebase:
- Download your Firebase service account key (serviceAccountKey.json)
- Place it in the project root directory
- Update the databaseURL in the Firebase configuration
## Project Structure
```
├── server.js           # Main application file
├── firebase.js         # Firebase configuration
├── models/
│   └── User.js        # Mongoose user model
├── .env               # Environment variables
└── serviceAccountKey.json
```
## API Endpoints
### Authentication
#### POST /register
- Register a new user
- Required fields: email, userName, password
- Returns: JWT token, user info
#### POST /login
- Authenticate user
- Required fields: email, password
- Returns: JWT token, user info
### User Management
#### GET /users
- Get all users (protected route)
- Requires: Authorization header with JWT token
- Returns: List of users (excluding passwords)
#### GET /user
- Get current user profile (protected route)
- Requires: Authorization header with JWT token
- Returns: User information
#### POST /refresh-token
- Refresh JWT token
- Required fields: email
- Returns: New JWT token
## Security Features
- Password hashing using bcrypt
- JWT for secure authentication
- Protected routes using middleware
- Sensitive data exclusion
- Request logging
- Comprehensive error handling
## Error Handling
The API implements comprehensive error handling:
- Input validation
- Authentication errors
- Server errors
- Not found errors
## Running the Application
Start the server:
```bash
npm start
```
The server will start on port 3000 (or the port specified in your environment variables).
## Development
To run in development mode with automatic restart:
```bash
npm run dev
```
## Environment Variables
Required environment variables:
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens
- Firebase configuration (via serviceAccountKey.json)
