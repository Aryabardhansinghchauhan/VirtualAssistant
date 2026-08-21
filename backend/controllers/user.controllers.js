import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Get Current User Error:", error);

    return res.status(400).json({
      message: "get current user error",
    });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      {
        new: true,
      }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Update Assistant Error:", error);

    return res.status(400).json({
      message: "updateAssistantError user error",
    });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || !command.trim()) {
      return res.status(400).json({
        type: "error",
        response: "Please say something.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        type: "error",
        response: "User not found.",
      });
    }

    
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    console.log("🤖 Sending request to Gemini...");
    console.log("📝 Command:", command);

   
    const result = await geminiResponse(
      command,
      assistantName,
      userName
    );

    console.log("🤖 Gemini result:", result);

   
    if (!result) {
      return res.status(500).json({
        type: "error",
        response: "Sorry, I didn't get a response.",
      });
    }

  

    let gemResult;

    try {
      gemResult =
        typeof result === "string"
          ? JSON.parse(result)
          : result;
    } catch (parseError) {
      console.error(
        "❌ Failed to parse Gemini result:",
        parseError
      );

      return res.status(500).json({
        type: "error",
        userInput: command,
        response: "I received an invalid response.",
      });
    }

    console.log(
      "✅ Parsed Gemini result:",
      gemResult
    );

    const type = gemResult.type;

    switch (type) {
    
      case "get-date":
        return res.status(200).json({
          type,
          userInput: gemResult.userInput || command,
          response: `Current date is ${moment().format(
            "YYYY-MM-DD"
          )}`,
        });

      
      case "get-time":
        return res.status(200).json({
          type,
          userInput: gemResult.userInput || command,
          response: `Current time is ${moment().format(
            "hh:mm A"
          )}`,
        });

      
      case "get-day":
        return res.status(200).json({
          type,
          userInput: gemResult.userInput || command,
          response: `Today is ${moment().format(
            "dddd"
          )}`,
        });

      case "get-month":
        return res.status(200).json({
          type,
          userInput: gemResult.userInput || command,
          response: `The current month is ${moment().format(
            "MMMM"
          )}`,
        });

      
      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.status(200).json({
          type,
          userInput: gemResult.userInput || command,
          response:
            gemResult.response ||
            "I don't have a response for that.",
        });

      
      case "error":
        console.error(
          "❌ Gemini returned an error:",
          gemResult.response
        );

        return res.status(500).json({
          type: "error",
          userInput: gemResult.userInput || command,
          response:
            gemResult.response ||
            "I'm having trouble connecting right now.",
        });

      // -------------------------
      // UNKNOWN TYPE
      // -------------------------
      default:
        console.error(
          "❌ Unknown Gemini response type:",
          type
        );

        return res.status(400).json({
          type: "error",
          userInput: command,
          response: "I didn't understand that command.",
        });
    }
  } catch (error) {
    console.error(
      "❌ Ask Assistant Error:",
      error
    );

    return res.status(500).json({
      type: "error",
      userInput: req.body?.command || "",
      response:
        "Sorry, something went wrong with the assistant.",
    });
  }
};
