const express = require('express');
const db = require('./firebase'); 
const app = express();
app.use(express.json()); 
const PORT = 3000;

require('dotenv').config();

app.get('/', (req, res) => {
    res.send("Welcome to Authentication Service!");
});

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register 
app.post('/register', async (req, res) => {
    const { email, userName, password } = req.body;

    if (!email || !userName || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email, userName, and password are required',
            data: null
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection('users').doc(email).set({
            email,
            userName,
            password: hashedPassword
        });

        const token = jwt.sign(
            { email, userName },  
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { userName, email, token }
        });
    }  catch (err) {
        console.error('Register error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userDoc = await db.collection('users').doc(email).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'No user found' });
        }

        const user = userDoc.data();

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: 'Wrong password' });
        }

        const token = jwt.sign(
            { email: user.email }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            success: true,
            message: 'Login successful',
            data: {
                token: token,
                userName: user.userName,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Fetch all users
const authenticateToken = async (req, res, next) => {
    console.log('Incoming request headers:', req.headers);
    const authHeader = req.headers['authorization'];
    console.log('Auth header received:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted token:', token);

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({
            success: false,
            message: 'Access token is required',
            data: null
        });
    }

    try {
        console.log('Attempting to verify token...');
        const decoded = jwt.verify(token, 'secretKey');
        console.log('Token verified successfully:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            data: null
        });
    }
};

app.get('/users', authenticateToken, async (req, res) => {
    console.log('Reached /users route handler');
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            // Exclude sensitive information like passwords
            const { password, ...userInfo } = userData;
            users.push(userInfo);
        });

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users',
            data: null
        });
    }
});

app.get('/user', authenticateToken, async (req, res) => {
    console.log('Reached /user route handler');
    try {

        const userEmail = req.user.email;
        const userDoc = await db.collection('users').doc(userEmail).get()

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        const userData = userDoc.data();
        const { password, ...userInfo } = userData;

        res.status(200).json({
            success: true,
            message: 'Current user retrieved successfully',
            data: userInfo
        });

    } catch (err) {
        console.error('Error fetching current user:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching current user',
            data: null
        });
    }
});

app.post('/refresh-token', async (req, res) => {
    const { email } = req.body;
    try {
        const userDoc = await db.collection('users').doc(email).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userDoc.data();

        // new token
        const token = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: { token }
        });


    } catch {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is working at the ${PORT}`);
});
app.disable('etag');  