"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const connection_1 = require("./DB/connection");
const PORT = process.env.PORT || 5000;
(0, connection_1.connectDB)().then(() => {
    app_1.default.listen(PORT, () => { console.log(`Server started on port ${PORT} and Database connected`); });
}).catch((error) => {
    console.error("Error connecting to the database:", error);
});
