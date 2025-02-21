"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3001;
// Middleware
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json());
// X API Endpoint
const TWITTER_API_URL = "https://api.x.com/2/users/personalized_trends";
// Fetch Twitter Trends Route
app.get("/trends", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.get(TWITTER_API_URL, {
            headers: {
                Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        res.json(response.data); // Send back the trends data
    }
    catch (error) {
        console.error("Error fetching trends:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ error: "Failed to fetch Twitter trends" });
    }
}));
// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
