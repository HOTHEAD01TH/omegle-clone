# Video Conferencing Application with Chat Feature

This project is a **video conferencing application** with a **real-time chat feature**. It consists of a **frontend** built using **React** and a **backend** powered by **Node.js and TypeScript**.

---

## **Project Structure**

```
.
├── backend
│   ├── dist               # Compiled JavaScript files
│   ├── src                # Source TypeScript files
│   │   ├── index.ts       # Server entry point
│   │   └── managers       # Room and User management logic
│   └── tsconfig.json      # TypeScript configuration
└── frontend
    ├── dist               # Production build files
    ├── public             # Static assets
    ├── src                # Application source code
    │   ├── components     # UI components (Chat, Video, Room, etc.)
    └── vite.config.ts     # Vite configuration
```

---

## **Features**

- **Video Conferencing:** Join and connect with other users seamlessly.
- **Real-time Chat:** Send and receive messages during the conference.
- **Scalable Backend:** Node.js with TypeScript for scalable server management.
- **Modern UI:** Built with React and Vite for a fast, responsive interface.

---

## **Getting Started**

### **Frontend Setup**

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### **Backend Setup**

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the backend:
   ```bash
   npx tsc
   ```
4. Start the backend server:
   ```bash
   node dist/index.js
   ```

---

## **Deployment on Vercel**

### **Frontend Deployment**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Vercel CLI if not already installed:
   ```bash
   npm install -g vercel
   ```
3. Deploy the frontend:
   ```bash
   vercel
   ```

### **Backend Deployment**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Deploy the backend:
   ```bash
   vercel
   ```

Ensure that API routes are properly set up and proxying is correctly handled between frontend and backend.

---

## **Environment Variables**

Ensure the following environment variables are set for both frontend and backend if required:

```
REACT_APP_API_URL=<backend_url>
NODE_ENV=production
```

---

## **Scripts**

### **Frontend Scripts**
- `npm run dev`: Starts the frontend development server.
- `npm run build`: Builds the frontend for production.
- `npm run preview`: Previews the production build.

### **Backend Scripts**
- `npx tsc`: Compiles TypeScript to JavaScript.
- `node dist/index.js`: Starts the backend server.

---

## **Contributing**

Feel free to fork this repository and submit pull requests for new features or bug fixes.

---

## **License**

This project is licensed under the [MIT License](LICENSE).

