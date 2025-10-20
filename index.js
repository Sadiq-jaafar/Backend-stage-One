import express from "express";
import cors from "cors";
import stringRoutes from "./routes/stringRoutes.js";
import {errorHandler} from "./middlewares/errorHandler.js";
// const stringRoutes = require("./routes/stringRoutes.js");
// const errorHandler = require("./middlewares/errorHandler.js");



const app = express();
const PORT = 3000 || process.env.PORT;

app.use(express.json());
app.use(cors());



app.get("/", (req ,res)=>{
    res.send(" String Analyser Service Backend stage One is runningg");
})

app.use("/strings", stringRoutes);

app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})