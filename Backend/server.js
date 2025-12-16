// Backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'; // <--- Add this import
import mongoose from 'mongoose'; // The tool that talks to MongoDB
import courseRoutes from './routes/courseRoutes.js'; // <--- 1. Import this
import adminRoutes from './routes/adminRoutes.js';

// 1. Load the secret .env keys
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware (The "Rules" of the restaurant)
app.use(express.json()); // Allows server to accept JSON data
app.use(cors({
    origin: "http://localhost:5173", // Only allow your specific Frontend to access this
    credentials: true
}));
app.use('/api/users', userRoutes); // <--- Add this line before the test route
app.use('/api/courses', courseRoutes); // <--- 2. Add this line
app.use('/api/admin', adminRoutes);

// 3. Connect to Database (The "Pantry")
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 4. Basic Test Route
app.get('/', (req, res) => {
    res.send("Server is running and Database is connected!");
});

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});