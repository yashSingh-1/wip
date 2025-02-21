import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import nlp from "compromise";
import Parser from "rss-parser";

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
  category: string[] | string | undefined;
}

const categories: Record<string, string[]> = {
    "Politics": ["election", "government", "president", "senate", "parliament", "policy"],
    "Tech": ["technology", "software", "hardware", "gadgets", "innovation"],
    "Startups": ["startup", "founder", "venture capital", "seed funding"],
    "AI": ["artificial intelligence", "machine learning", "deep learning", "neural network", "AI"],
    "Finance": ["stock", "market", "economy", "inflation", "interest rate", "trading", "crypto"]
};

function categorizeHeadline(headline: string): string {
    const doc = nlp(headline);
    console.log("Doc from nlp", doc)
    const lemmatizedWords = doc.terms().out('array').map((word: any) => word.toLowerCase());
    console.log("Lemmatize words", lemmatizedWords)

    for (const [category, keywords] of Object.entries(categories)) {
        if (lemmatizedWords.some((word: any) => keywords.includes(word))) {
            return category;
        }
    }
    
    return "Uncategorized"; // Default category
}

// Function to fetch and parse RSS feeds
async function fetchNews() {
  let allHeadlines: NewsItem[] = [];

  for (const url of rssFeeds) {
    try {
      let feed = await parser.parseURL(url);
    //   console.log("Feed here: ", feed)
      feed.items.slice(0, 10).forEach((item) => {
        const category = categorizeHeadline(item.title!)
        allHeadlines.push({
          title: item.title,
          link: item.link,
          source: feed.title,
          description: item.content,
          dateOfPost: item.pubDate,
          category: category
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
