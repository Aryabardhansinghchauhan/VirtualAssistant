import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `${process.env.GEMINI_API_URL}?key=${apiKey}`;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is missing");
      throw new Error("GEMINI_API_KEY is missing");
    }

    if (!process.env.GEMINI_API_URL) {
      console.error("❌ GEMINI_API_URL is missing");
      throw new Error("GEMINI_API_URL is missing");
    }

    const prompt = `You are a virtual assistant named ${assistantName}, created by ${userName}.
You are not Google. You act like a voice-enabled assistant.

Your task is to understand the user's natural language and reply ONLY with a valid JSON object.

The JSON must have exactly these fields:

{
  "type": "general",
  "userInput": "${command}",
  "response": "short spoken response"
}

Allowed type values:
- "general"
- "google-search"
- "youtube-search"
- "youtube-play"
- "get-time"
- "get-date"
- "get-day"
- "get-month"
- "calculator-open"
- "instagram-open"
- "facebook-open"
- "weather-show"

Type meanings:
- "general": factual, informational, conversational, or simple questions.
- "google-search": when the user wants to search Google.
- "youtube-search": when the user wants to search YouTube.
- "youtube-play": when the user wants to play a video or song.
- "calculator-open": when the user wants a calculator.
- "instagram-open": when the user wants Instagram.
- "facebook-open": when the user wants Facebook.
- "weather-show": when the user asks about weather.
- "get-time": when the user asks for the current time.
- "get-date": when the user asks for today's date.
- "get-day": when the user asks what day it is.
- "get-month": when the user asks for the current month.

Important:
- If the user asks a normal question, use "general".
- Use ${userName} if asked who created you.
- Keep the response short because it will be spoken aloud.
- Do NOT use markdown.
- Do NOT use code fences.
- Reply ONLY with valid JSON.
- Do not add any text before or after the JSON.

User input:
${command}
`;

    console.log("🤖 Sending request to Gemini...");
    console.log("📝 Command:", command);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await axios.post(
          apiUrl,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ Gemini API request successful");

        const rawText =
          result.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          console.error(
            "❌ Gemini returned no text:",
            JSON.stringify(result.data, null, 2)
          );

          throw new Error("Gemini returned no response text");
        }

        console.log("🤖 Raw Gemini response:", rawText);

        // Remove markdown code fences if Gemini happens to return them
        const cleanedText = rawText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        let parsedResponse;

        try {
          parsedResponse = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error(
            "❌ Failed to parse Gemini JSON:",
            cleanedText
          );

          // Fallback response
          parsedResponse = {
            type: "general",
            userInput: command,
            response: cleanedText,
          };
        }

        return parsedResponse;
      } catch (error) {
        console.error(
          `❌ Gemini attempt ${attempt} failed:`,
          error.response?.data || error.message
        );

        if (error.response?.status === 429 && attempt < 3) {
          console.log(
            `⚠️ Rate limited — waiting ${attempt * 2}s...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, attempt * 2000)
          );

          continue;
        }

        throw error;
      }
    }
  } catch (error) {
    console.error(
      "❌ Gemini API Error:",
      error.response?.data || error.message
    );

    return {
      type: "error",
      userInput: command,
      response:
        "I'm having trouble connecting right now. Please try again later.",
    };
  }
};

export default geminiResponse;