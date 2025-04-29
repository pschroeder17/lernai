# Setting Up MongoDB Atlas for Lernai

Since you don't have MongoDB installed locally, we'll use MongoDB Atlas, which is a cloud-based MongoDB service with a free tier that's perfect for development.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (you can use Google, GitHub, or email)

## Step 2: Create a New Cluster

1. After signing up, you'll be prompted to create a new cluster
2. Choose the "FREE" tier
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure) and region (choose one close to you)
4. Click "Create Cluster" (this may take a few minutes to provision)

## Step 3: Set Up Database Access

1. In the left sidebar, click on "Database Access" under "Security"
2. Click "Add New Database User"
3. Create a username and password (make sure to remember these)
4. Set privileges to "Read and Write to Any Database"
5. Click "Add User"

## Step 4: Set Up Network Access

1. In the left sidebar, click on "Network Access" under "Security"
2. Click "Add IP Address"
3. For development purposes, you can click "Allow Access from Anywhere" (not recommended for production)
4. Click "Confirm"

## Step 5: Get Your Connection String

1. In the left sidebar, click on "Database" under "Deployments"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as your driver and the appropriate version
5. Copy the connection string provided

## Step 6: Update Your .env.local File

1. Open the `.env.local` file in your project
2. Replace the `MONGODB_URI` value with your connection string
3. Make sure to replace `<password>` in the connection string with your actual password
4. Also replace `<dbname>` with `lernai`

Your `.env.local` file should look something like this:

```
MONGODB_URI=mongodb+srv://yourusername:<password>@cluster0.mongodb.net/lernai?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
```

## Step 7: Get an OpenAI API Key

1. Go to [OpenAI API](https://platform.openai.com/signup)
2. Sign up for an account if you don't have one
3. Navigate to the API section
4. Create a new API key
5. Copy the API key and add it to your `.env.local` file

## Step 8: Run the Application

Now you can run the application:

```bash
cd nextjs-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.