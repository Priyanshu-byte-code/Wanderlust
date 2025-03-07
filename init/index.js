const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
    .then(() => {
        console.log("Connected To DB");
    })
    .catch((err) => {
        console.log("Error Connecting To DB");
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});
       initData.data= initData.data.map((obj)=>({...obj,owner:'67b1dd5a448dd89ed18fb9e0'}));
        await Listing.insertMany(initData.data);
        console.log("data was initialized");
    } catch (error) {
        console.error("Error inserting data:", error);
    }
};

initDB();
