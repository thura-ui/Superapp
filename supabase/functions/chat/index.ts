import { createClient } from "npm:@supabase/supabase-js@2";
import Groq from "npm:groq-sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Static Knowledge Base
const staticFaqData = [
  { id: 1, question: "Can I change to another phone to use this eSIM?", answer: "No, once an eSIM is installed on a device, it cannot be transferred to another phone. eSIMs are device-specific and locked to the phone where they were first activated. If you need to use a different device, you will need to purchase a new eSIM plan." },
  { id: 2, question: "Why is there no add eSIM/add a cellular plan? How to install?", answer: "To install eSIM, go to Settings > Cellular/Mobile Data > Add eSIM. Check if your phone supports eSIM by dialing *#06#. If EID barcode is displayed, your phone supports eSIM." },
  { id: 3, question: "Is it possible to end the package early?", answer: "eSIM data packages typically cannot be cancelled once activated. The validity period starts from the moment of activation and runs for the purchased duration." },
  { id: 4, question: "Is it possible to activate a package while you're in Myanmar?", answer: "No, you can only install a travel eSIM before your flight on your phone, and it will activate once you have landed at your destination." },
  { id: 5, question: "Does Travel eSIM have a phone number?", answer: "Most travel eSIMs are data-only and do not include a phone number for making calls or sending SMS. They are designed specifically for internet connectivity while traveling." },
  { id: 6, question: "How do I check my remaining data balance?", answer: "You can check your data balance through the 'My Data' section after you have purchased our travel eSIM or once you have started using it at your overseas destination." },
  { id: 7, question: "Does travel eSIM support hotspot sharing?", answer: "Yes, travel eSIM supports hotspot sharing." },
  { id: 15, question: "What is your refund policy for eSIM purchases?", answer: "Refunds are available for eSIM purchases that have not been installed or activated. Once the eSIM QR code has been scanned and installed, it cannot be refunded." },
  { id: 16, question: "Can I get a refund if the eSIM doesn't work in my destination?", answer: "If you experience technical issues that prevent your eSIM from working properly, please contact our support team first. We will troubleshoot the issue or offer a refund if it cannot be resolved." }
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const userQuery = message ? message.trim() : "";
    const lowerQuery = userQuery.toLowerCase();

    // -------------------------------------------------------------
    // OPTIMIZATION 1: Human / Viber Contact Keywords (0 API Calls)
    // -------------------------------------------------------------
    const contactKeywords = ["viber", "human", "agent", "person", "support team", "phone", "contact", "call", "admin", "customer service", "လူနဲ စကားပြောချင်", "ဗိုင်ဘာ", "ဖုန်းနံပါတ်"];
    if (contactKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return new Response(
        JSON.stringify({
          reply: "You can chat directly with our support team on Viber: https://viber.click/959943229667 or call +959943229667, +959251167248.",
          source: "local_rule"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Database & Groq Initialize
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqApiKey = Deno.env.get("GROQ_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const groq = new Groq({ apiKey: groqApiKey });

    // -------------------------------------------------------------
    // OPTIMIZATION 2: Exact DB Cache Check (0 API Calls)
    // -------------------------------------------------------------
    const { data: cachedFaqs } = await supabase.from("faq_cache").select("*");
    if (cachedFaqs && cachedFaqs.length > 0) {
      const exactDbMatch = cachedFaqs.find(f => f.question.toLowerCase() === lowerQuery);
      if (exactDbMatch) {
        return new Response(
          JSON.stringify({ reply: exactDbMatch.answer, source: "database_cache" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // -------------------------------------------------------------
    // OPTIMIZATION 3: Multilingual Groq AI Prompt (1 API Call)
    // -------------------------------------------------------------
    const staticQuestionsList = staticFaqData.map((f) => `Question: "${f.question}" -> Answer: "${f.answer}"`).join("\n");

    const aiMatchResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful Customer Service AI Assistant for "Simless Travel eSIM".
CRITICAL INSTRUCTION FOR LANGUAGE:
- Respond in the EXACT SAME LANGUAGE as the user's input query.
- If the user asks in Myanmar language (Burmese), respond fully in natural Myanmar language (Burmese).
- If the user asks in English, respond in English.

GUIDELINES:
1. Use the Knowledge Base below to answer eSIM installation, usage, refund, and support questions.
2. If the user asks how to install or setup eSIM (in English or Myanmar like "install ဘယ်လိုလုပ်ရမလဲ"), explain the installation steps clearly using the Knowledge Base.
3. If the query is completely unrelated to travel, phones, or eSIMs (e.g. cooking, weather), politely say in the user's language that you can only assist with eSIM questions.

Knowledge Base:
${staticQuestionsList}`
        },
        { role: "user", content: userQuery }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 300
    });

    const botReply = aiMatchResponse.choices[0]?.message?.content?.trim() || "";

    // Database ထဲတွင် Cache သိမ်းဆည်းခြင်း
    if (botReply) {
      await supabase.from("faq_cache").insert([
        {
          question: userQuery,
          answer: botReply
        }
      ]);
    }

    return new Response(
      JSON.stringify({ reply: botReply, source: "groq_api" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("rate_limit")) {
      return new Response(
        JSON.stringify({
          reply: "Our AI chat limit is full right now. Please chat directly with our support team on Viber: https://viber.click/959943229667",
          source: "rate_limit_viber"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});