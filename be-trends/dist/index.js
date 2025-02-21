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
const compromise_1 = __importDefault(require("compromise"));
const rss_parser_1 = __importDefault(require("rss-parser"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3001;
// Middleware
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json());
const parser = new rss_parser_1.default();
// List of RSS feeds
const rssFeeds = [
    "http://rss.cnn.com/rss/edition.rss",
    "https://www.theguardian.com/uk/rss",
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    "https://ir.thomsonreuters.com/rss/news-releases.xml?items=15",
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
];
const categories = {
    "Politics": ["election", "government", "president", "senate", "parliament", "policy"],
    "Tech": ["technology", "software", "hardware", "gadgets", "innovation"],
    "Startups": ["startup", "founder", "venture capital", "seed funding"],
    "AI": ["artificial intelligence", "machine learning", "deep learning", "neural network", "AI"],
    "Finance": ["stock", "market", "economy", "inflation", "interest rate", "trading", "crypto"]
};
function categorizeHeadline(headline) {
    const doc = (0, compromise_1.default)(headline);
    const lemmatizedWords = doc.terms().out('array').map((word) => word.toLowerCase());
    for (const [category, keywords] of Object.entries(categories)) {
        if (lemmatizedWords.some((word) => keywords.includes(word))) {
            return category;
        }
    }
    return "Uncategorized"; // Default category
}
// Function to fetch and parse RSS feeds
function fetchNews() {
    return __awaiter(this, void 0, void 0, function* () {
        let allHeadlines = [];
        for (const url of rssFeeds) {
            try {
                let feed = yield parser.parseURL(url);
                //   console.log("Feed here: ", feed)
                feed.items.slice(0, 10).forEach((item) => {
                    const category = categorizeHeadline(item.title);
                    allHeadlines.push({
                        title: item.title,
                        link: item.link,
                        source: feed.title,
                        description: item.content,
                        dateOfPost: item.pubDate,
                        category: category
                    });
                });
            }
            catch (error) {
                console.error(`Error fetching ${url}:`, error);
            }
        }
        console.log(allHeadlines); // You can send this to your frontend
    });
}
// Run the function
fetchNews();
// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
