# 🌾 AgriConnect

**AgriConnect** is a full-stack platform designed to connect farmers directly with buyers, streamline agricultural transactions, and support resource sharing across rural communities. Built with the MERN stack, it ensures a fast, secure, and user-friendly experience for all stakeholders.

---

## 🚀 Features

- 👨‍🌾 Farmer Registration & Product Listing  
- 🛒 Buyer Dashboard for Browsing & Ordering Products  
- 📦 Real-time Order Management & Notifications  
- 📊 Analytics Dashboard for Crop & Sale Tracking  
- 🔐 Secure Login for Farmers and Buyers  
- 🌐 Mobile-responsive UI

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- Axios  
- React Router

### Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT for Authentication  
- Multer (Image/File Uploads)

---



## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/it21336218/agriconnect.git

### 2. Install dependencies

- Backend:
```bash
cd server
npm install
```

- Frontend:
```bash
cd ../client
npm install
```

### 3. Set up environment variables

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run the application

- Start the backend:
```bash
cd server
npm run dev
```

- Start the frontend:
```bash
cd ../client
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🛡️ Security

- Role-based authentication (Farmers & Buyers)  
- Data validation & sanitization  
- JWT token-based sessions

---



## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---


✨ Built with love for farmers and communities!
