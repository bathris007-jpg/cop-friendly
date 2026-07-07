const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
    console.log("Starting local in-memory MongoDB...");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log(`Local MongoDB started at: ${uri}`);
    
    // Set the environment variable so server.js picks it up
    process.env.MONGODB_URI = uri;
    
    // Start the main application
    require('./server.js');
}

start().catch(console.error);
