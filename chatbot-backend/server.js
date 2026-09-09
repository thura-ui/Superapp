import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// 1. dotenv config ကို အရင်ဆုံး ရန်းပါ
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 2. process.env မှ ခေါ်ယူခြင်း (VITE_ prefix ပါတာော အပါအဝင် safe check လုပ်ပေးထားသည်)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

// Debugging အတွက် Terminal မှာ ဘာတွေ ထွက်လာသလဲ ကြည့်ရန်
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: SUPABASE_URL သို့မဟုတ် Key များကို .env ထဲတွင် ရှာမတွေ့ပါ။");
  console.log("ဖတ်ရရှိသော .env တန်ဖိုးများ -", { 
    URL: process.env.SUPABASE_URL, 
    KEY: process.env.SUPABASE_SERVICE_ROLE_KEY 
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const groq = new Groq({ apiKey: groqApiKey });

// ... ကျန်တဲ့ /api/chat route နဲ့ app.listen စာကြောင်းများ အတူတူပင်ဖြစ်ပါတယ် ...
// 2. Static Knowledge Base
const staticFaqData = [
  { id: 1, question: "Can I change to another phone to use this eSIM?", answer: "No, once an eSIM is installed on a device, it cannot be transferred to another phone. eSIMs are device-specific and locked to the phone where they were first activated." },
  { id: 2, question: "Why is there no add eSIM/add a cellular plan? How to install?", answer: "To install an eSIM, go to Settings > Cellular/Mobile Data > Add eSIM on your device. Check if your phone supports eSIM by dialing *#06#." },
  { id: 3, question: "Is it possible to end the package early?", answer: "eSIM data packages typically cannot be cancelled once activated." },
  { id: 4, question: "Is it possible to activate a package while you're in Myanmar?", answer: "No, you can only install a travel eSIM before your flight on your phone, and it will activate once you have landed at your destination." },
  { id: 5, question: "Does Travel eSIM have a phone number?", answer: "Most travel eSIMs are data-only and do not include a phone number for making calls or sending SMS." },
  { id: 6, question: "How do I check my remaining data balance?", answer: "You can check your data balance through the 'My Data' section after you have purchased our travel eSIM." },
  { id: 7, question: "Does travel eSIM support hotspot sharing?", answer: "Yes, travel eSIM supports hotspot sharing." },
  { id: 15, question: "What is your refund policy for eSIM purchases?", answer: "Refunds are available for eSIM purchases that have not been installed or activated." },
  { id: 16, question: "Can I get a refund if the eSIM doesn't work in my destination?", answer: "If you experience technical issues, please contact our support team first. We will troubleshoot or offer a refund if unresolved." }
];

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userQuery = message ? message.trim() : "";
    const lowerQuery = userQuery.toLowerCase();

    // STEP A: Viber / Human Contact Keywords Check (0 API Call)
    const contactKeywords = ["viber", "human", "agent", "person", "support team", "phone", "contact", "call", "admin", "customer service", "လူနဲ စကားပြောချင်", "ဗိုင်ဘာ", "ဖုန်းနံပါတ်"];
    if (contactKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return res.json({
        reply: "You can chat directly with our support team on Viber: https://viber.click/959943229667 or call +959943229667, +959251167248.",
        source: "local_rule"
      });
    }

    // STEP B: Supabase Database Cache Check (0 Groq Call)
    try {
      const { data: cachedFaqs } = await supabase.from("faq_cache").select("*");
      if (cachedFaqs && cachedFaqs.length > 0) {
        const exactDbMatch = cachedFaqs.find(f => f.question?.toLowerCase() === lowerQuery);
        if (exactDbMatch) {
          return res.json({ reply: exactDbMatch.answer, source: "database_cache" });
        }
      }
    } catch (cacheErr) {
      console.error("DB Cache Fetch Error:", cacheErr);
    }

    // STEP C: Call Groq API (openai/gpt-oss-20b Model)
    const staticQuestionsList = staticFaqData.map((f) => `Question: "${f.question}" -> Answer: "${f.answer}"`).join("\n");

    const aiMatchResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful Customer Service AI Assistant for "Simless Travel eSIM".
CRITICAL INSTRUCTION: ALWAYS respond in ENGLISH, regardless of the user's input language.

GUIDELINES:
1. Understand the user's query and match it to the best answer in the Knowledge Base below.
2. If the user asks how to install/setup eSIM, provide clear installation steps in ENGLISH.
3. If the query is completely unrelated to travel/eSIM, state in ENGLISH: "I am an eSIM customer service chatbot, so I can only answer eSIM-related questions."
4. Keep all responses concise and under 100 words.

Knowledge Base:
${staticQuestionsList}`
        },
        { role: "user", content: userQuery }
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      max_tokens: 300
    });

    const botReply = aiMatchResponse.choices[0]?.message?.content?.trim() || "I am unable to process your request at the moment.";

    // STEP D: Save Answer to Supabase Database Cache
    if (botReply) {
      try {
        await supabase.from("faq_cache").insert([
          {
            question: userQuery,
            answer: botReply
          }
        ]);
      } catch (insertErr) {
        console.error("DB Cache Insert Error:", insertErr);
      }
    }

    return res.json({ reply: botReply, source: "groq_api" });

  } catch (error) {
    console.error("Node.js Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Node.js Chatbot Server running on port ${PORT}`));