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
    "Politics": [
        "election", "government", "president", "senate", "parliament", "policy", "vote",
        "law", "minister", "congress", "campaign", "diplomacy", "democracy", "legislation",
        "republican", "democrat", "left-wing", "right-wing", "politician", "constitution",
        "foreign relations", "political party", "cabinet", "prime minister", "Trump"
    ],
    "Tech": [
        "technology", "software", "hardware", "gadgets", "innovation", "AI", "machine learning",
        "cloud computing", "5G", "semiconductors", "big data", "robotics", "cybersecurity",
        "quantum computing", "programming", "blockchain", "IoT", "AR", "VR", "augmented reality",
        "virtual reality", "data science", "metaverse", "autonomous", "coding", "tech startup"
    ],
    "Startups": [
        "startup", "founder", "venture capital", "seed funding", "entrepreneur", "unicorn",
        "incubator", "accelerator", "angel investor", "fundraising", "scaleup", "IPO",
        "bootstrapped", "early-stage", "pitch deck", "startup ecosystem", "Silicon Valley",
        "MVP", "growth hacking", "disruptive", "lean startup"
    ],
    "AI": [
        "artificial intelligence", "machine learning", "deep learning", "neural network", "AI",
        "NLP", "chatbot", "AGI", "computer vision", "GPT", "LLM", "OpenAI", "transformer",
        "self-learning", "supervised learning", "unsupervised learning", "AI ethics",
        "AI bias", "model training", "data annotation", "generative AI", "reinforcement learning"
    ],
    "Finance": [
        "stock", "market", "economy", "inflation", "interest rate", "trading", "crypto",
        "Bitcoin", "Ethereum", "forex", "investment", "Wall Street", "Nasdaq", "S&P 500",
        "hedge fund", "banking", "recession", "financial crisis", "bonds", "mutual funds",
        "federal reserve", "GDP", "taxes", "wealth management", "fiscal policy"
    ],
    "Sports": [
        "football", "soccer", "basketball", "NBA", "NFL", "Olympics", "World Cup",
        "tennis", "golf", "cricket", "FIFA", "championship", "stadium", "athlete",
        "medal", "record-breaking", "team", "league", "tournament", "goal", "grand slam",
        "Formula 1", "racing", "athletics", "coach", "referee", "MVP", "Trophy"
    ],
    "Entertainment": [
        "Hollywood", "Bollywood", "movie", "film", "celebrity", "Netflix", "actor",
        "actress", "director", "Oscar", "Grammy", "blockbuster", "album", "song",
        "concert", "festival", "comedy", "drama", "thriller", "TV series", "box office",
        "script", "animation", "streaming", "cinema", "theft"
    ],
    "Science": [
        "astronomy", "physics", "chemistry", "biology", "genetics", "space", "NASA",
        "quantum mechanics", "black hole", "evolution", "climate change", "biology",
        "pandemic", "research", "experiment", "scientist", "medicine", "theory",
        "particle physics", "space exploration", "satellite", "innovation"
    ],
    "Health": [
        "medicine", "vaccine", "COVID", "pandemic", "doctor", "hospital", "mental health",
        "nutrition", "diet", "fitness", "wellness", "cardiology", "diabetes", "disease",
        "treatment", "public health", "surgery", "cancer", "obesity", "immunity",
        "WHO", "epidemic", "telemedicine", "biotech", "clinical trial"
    ],
    "Business": [
        "corporate", "CEO", "merger", "acquisition", "earnings", "market cap",
        "company", "business growth", "revenue", "profit", "loss", "industry",
        "brand", "e-commerce", "supply chain", "logistics", "retail", "consumer spending",
        "marketing", "advertising", "franchise", "partnership", "business strategy"
    ],
    "Climate": [
        "climate change", "global warming", "carbon emissions", "sustainability",
        "environment", "green energy", "solar power", "wind energy", "deforestation",
        "wildlife", "pollution", "recycling", "eco-friendly", "fossil fuels",
        "ozone layer", "renewable energy", "climate crisis", "biodiversity",
        "environmental impact", "carbon footprint"
    ]
};
function categorizeHeadline(headline) {
    const doc = (0, compromise_1.default)(headline);
    // console.log("Doc from nlp", doc)
    const lemmatizedWords = doc.terms().out('array').map((word) => word.toLowerCase());
    // console.log("Lemmatize words", lemmatizedWords)
    for (const [category, keywords] of Object.entries(categories)) {
        if (lemmatizedWords.some((word) => keywords.includes(word))) {
            return category;
        }
    }
    return "Uncategorized"; // Default category
}
// async function categorizeHeadline(headline: string): Promise<string> {
//     // Dynamically import the ESM module
//     const { pipeline } = await import("@xenova/transformers");
//     // Load the model
//     const classifier = await pipeline("text-classification", "Xenova/bert-base-multilingual-uncased");
//     // Get model predictions
//     const results = await classifier(headline);
//     return results[0].toString();
// }
function fetchNews() {
    return __awaiter(this, void 0, void 0, function* () {
        let allHeadlines = [];
        for (const url of rssFeeds) {
            try {
                let feed = yield parser.parseURL(url);
                //   console.log("Feed here: ", feed)
                feed.items.slice(0, 10).forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    const category = categorizeHeadline(item.content);
                    allHeadlines.push({
                        title: item.title,
                        link: item.link,
                        source: feed.title,
                        description: item.content,
                        dateOfPost: item.pubDate,
                        category: item.categories ? item.categories[0] : category
                    });
                }));
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
