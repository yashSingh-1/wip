import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import nlp from "compromise";
import Parser from "rss-parser";
import { pipeline } from "@xenova/transformers";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());

const parser = new Parser();

// List of RSS feeds
const rssFeeds = [
  "http://rss.cnn.com/rss/edition.rss",
  "https://www.theguardian.com/uk/rss",
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "https://ir.thomsonreuters.com/rss/news-releases.xml?items=15",
  "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
];

interface NewsItem {
  title: string | undefined;
  link: string | undefined;
  source: string | undefined;
  description: string | undefined;
  dateOfPost: string | undefined;
  category: string[] | string | undefined | Promise<string>;
}

const categories: Record<string, string[]> = {
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


// function categorizeHeadline(headline: string): string {
//     const doc = nlp(headline);
//     // console.log("Doc from nlp", doc)
//     const lemmatizedWords = doc.terms().out('array').map((word: any) => word.toLowerCase());
//     // console.log("Lemmatize words", lemmatizedWords)

//     for (const [category, keywords] of Object.entries(categories)) {
//         if (lemmatizedWords.some((word: any) => keywords.includes(word))) {
//             return category;
//         }
//     }
    
//     return "Uncategorized"; // Default category
// }

async function categorizeHeadline(headline: string): Promise<string> {
    // Dynamically import the ESM module
    const { pipeline } = await import("@xenova/transformers");

    // Load the model
    const classifier = await pipeline("text-classification", "Xenova/bert-base-multilingual-uncased");

    // Get model predictions
    const results = await classifier(headline);

    return results[0].toString();
}

async function fetchNews() {
  let allHeadlines: NewsItem[] = [];

  for (const url of rssFeeds) {
    try {
      let feed = await parser.parseURL(url);
    //   console.log("Feed here: ", feed)
      feed.items.slice(0, 10).forEach(async (item) => {
        const category = categorizeHeadline(item.content!)
        allHeadlines.push({
          title: item.title,
          link: item.link,
          source: feed.title,
          description: item.content,
          dateOfPost: item.pubDate,
          category: item.categories ? item.categories[0] : category
        });
      });
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
    }
  }

  console.log(allHeadlines); // You can send this to your frontend
}

// Run the function
fetchNews();

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
