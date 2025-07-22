import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import cors from "cors";
// import multer from "multer";
// import connectDB from "./config/connectDB";

require("dotenv").config();

let app = express();

// const upload = multer(); // Không lưu file, chỉ để xử lý form-data
// // Dùng middleware của multer để xử lý form-data
// app.use(upload.none());

app.use(cors());
// const corsOptions = {
//   origin: ["http://localhost:8081", "https://booklovers-demo.vercel.app"],
//   credentials: true,
// };

// app.use(cors(corsOptions));

//config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static("public/uploads"));
app.use("/avatar", express.static("public/avatar"));

viewEngine(app);
initWebRoutes(app);

let port = process.env.PORT || 6969;

app.listen(port, () => {
  console.log("backend nodejs is runnung on the port: " + port);
});
