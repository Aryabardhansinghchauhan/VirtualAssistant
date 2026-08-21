import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif";

function Home() {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const isMountedRef = useRef(false);

  const synth = window.speechSynthesis;

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });

      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  // ==============================
  // START RECOGNITION
  // ==============================

  const startRecognition = () => {
    if (!recognitionRef.current) {
      console.error("❌ Recognition is not initialized");
      return;
    }

    if (isSpeakingRef.current) {
      console.log("🔊 AI is speaking...");
      return;
    }

    if (isRecognizingRef.current) {
      console.log("🎤 Recognition is already running");
      return;
    }

    try {
      recognitionRef.current.start();
      console.log("🎤 Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("❌ Recognition start error:", error);
      }
    }
  };

  // ==============================
  // SPEAK
  // ==============================

  const speak = (text) => {
    if (!text) return;

    console.log("🔊 AI speaking:", text);

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";

    const voices = synth.getVoices();

    const englishVoice =
      voices.find((voice) => voice.lang === "en-US") ||
      voices.find((voice) => voice.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    isSpeakingRef.current = true;

    utterance.onstart = () => {
      console.log("🔊 Speech started");
    };

    utterance.onend = () => {
      console.log("🔊 Speech ended");

      isSpeakingRef.current = false;
      setAiText("");

      setTimeout(() => {
        if (
          isMountedRef.current &&
          !isRecognizingRef.current
        ) {
          startRecognition();
        }
      }, 700);
    };

    utterance.onerror = (error) => {
      console.error("❌ Speech synthesis error:", error);

      isSpeakingRef.current = false;

      setTimeout(() => {
        if (
          isMountedRef.current &&
          !isRecognizingRef.current
        ) {
          startRecognition();
        }
      }, 700);
    };

    synth.speak(utterance);
  };

  // ==============================
  // HANDLE COMMAND
  // ==============================

  const handleCommand = (data) => {
    if (!data) {
      console.error("❌ No command data received");
      return;
    }

    const {
      type,
      userInput,
      response,
    } = data;

    console.log("📦 Command:", data);

    if (response) {
      setAiText(response);
      speak(response);
    }

    // Google Search
    if (type === "google-search") {
      const query = encodeURIComponent(userInput);

      window.open(
        `https://www.google.com/search?q=${query}`,
        "_blank"
      );
    }

    // Calculator
    if (type === "calculator-open") {
      window.open(
        "https://www.google.com/search?q=calculator",
        "_blank"
      );
    }

    // Instagram
    if (type === "instagram-open") {
      window.open(
        "https://www.instagram.com/",
        "_blank"
      );
    }

    // Facebook
    if (type === "facebook-open") {
      window.open(
        "https://www.facebook.com/",
        "_blank"
      );
    }

    // Weather
    if (type === "weather-show") {
      window.open(
        "https://www.google.com/search?q=weather",
        "_blank"
      );
    }

    // YouTube
    if (
      type === "youtube-search" ||
      type === "youtube-play"
    ) {
      const query = encodeURIComponent(userInput);

      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }
  };

  // ==============================
  // SPEECH RECOGNITION
  // ==============================

  useEffect(() => {
    isMountedRef.current = true;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error(
        "❌ Speech Recognition is not supported in this browser."
      );

      return;
    }

    console.log("✅ Speech Recognition supported");

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    // Listen for one command at a time.
    recognition.continuous = false;

    // English speech recognition.
    // Change to "hi-IN" if you mainly speak Hindi.
    recognition.lang = "en-US";

    recognition.interimResults = false;

    // ==============================
    // ON START
    // ==============================

    recognition.onstart = () => {
      console.log("🎤 Recognition started");

      isRecognizingRef.current = true;
      setListening(true);
    };

    // ==============================
    // ON RESULT
    // ==============================

    recognition.onresult = async (event) => {
      try {
        const transcript =
          event.results[
            event.results.length - 1
          ][0].transcript.trim();

        console.log("🎤 You said:", transcript);

        if (!transcript) {
          return;
        }

        setUserText(transcript);

        // Stop listening while Gemini processes
        try {
          recognition.stop();
        } catch (error) {
          console.log(error);
        }

        isRecognizingRef.current = false;
        setListening(false);

        console.log("🤖 Sending text to Gemini...");

        try {
          const data =
            await getGeminiResponse(transcript);

          console.log(
            "🤖 Gemini response:",
            data
          );

          if (!data) {
            console.error(
              "❌ Gemini returned no data."
            );

            setUserText("");
            setAiText(
              "Sorry, I didn't get a response."
            );

            speak(
              "Sorry, I didn't get a response."
            );

            return;
          }

          if (!data.response) {
            console.error(
              "❌ Gemini response has no response field:",
              data
            );

            setUserText("");
            setAiText(
              "Sorry, I couldn't understand that."
            );

            speak(
              "Sorry, I couldn't understand that."
            );

            return;
          }

          setUserText("");

          setAiText(data.response);

          handleCommand(data);
        } catch (error) {
          console.error(
            "❌ Gemini request failed:",
            error
          );

          setUserText("");
          setAiText(
            "Sorry, something went wrong."
          );

          speak(
            "Sorry, something went wrong. Please try again."
          );
        }
      } catch (error) {
        console.error(
          "❌ Error processing speech:",
          error
        );
      }
    };

    // ==============================
    // ON ERROR
    // ==============================

    recognition.onerror = (event) => {
      console.error(
        "🎤 Recognition error:",
        event.error
      );

      isRecognizingRef.current = false;
      setListening(false);

      // IMPORTANT:
      // Don't restart when permission is denied.
      if (event.error === "not-allowed") {
        console.error(
          "❌ Microphone permission denied."
        );

        return;
      }

      // Microphone/device problem
      if (event.error === "audio-capture") {
        console.error(
          "❌ No microphone detected."
        );

        return;
      }

      // User didn't speak
      if (event.error === "no-speech") {
        console.log(
          "⚠️ No speech detected."
        );

        setTimeout(() => {
          if (
            isMountedRef.current &&
            !isSpeakingRef.current &&
            !isRecognizingRef.current
          ) {
            startRecognition();
          }
        }, 1000);

        return;
      }

      // Network problem
      if (event.error === "network") {
        console.error(
          "❌ Speech recognition network error."
        );

        return;
      }
    };

    // ==============================
    // ON END
    // ==============================

    recognition.onend = () => {
      console.log(
        "🎤 Recognition ended"
      );

      isRecognizingRef.current = false;
      setListening(false);
    };

    // ==============================
    // GREETING
    // ==============================

    const greeting =
      new SpeechSynthesisUtterance(
        `Hello ${
          userData?.name || ""
        }, what can I help you with?`
      );

    greeting.lang = "en-US";

    const voices = synth.getVoices();

    const englishVoice =
      voices.find(
        (voice) => voice.lang === "en-US"
      ) ||
      voices.find((voice) =>
        voice.lang.startsWith("en")
      );

    if (englishVoice) {
      greeting.voice = englishVoice;
    }

    synth.cancel();

    isSpeakingRef.current = true;

    console.log("🔊 Greeting...");

    synth.speak(greeting);

    greeting.onend = () => {
      console.log(
        "🔊 Greeting finished"
      );

      isSpeakingRef.current = false;

      setTimeout(() => {
        if (isMountedRef.current) {
          startRecognition();
        }
      }, 700);
    };

    greeting.onerror = (error) => {
      console.error(
        "❌ Greeting error:",
        error
      );

      isSpeakingRef.current = false;

      setTimeout(() => {
        if (isMountedRef.current) {
          startRecognition();
        }
      }, 700);
    };

    // ==============================
    // CLEANUP
    // ==============================

    return () => {
      console.log(
        "🧹 Cleaning Home component"
      );

      isMountedRef.current = false;

      try {
        recognition.stop();
      } catch (error) {
        // Ignore stop errors
      }

      synth.cancel();

      isRecognizingRef.current = false;
      isSpeakingRef.current = false;

      setListening(false);
    };
  }, []);

  // ==============================
  // UI
  // ==============================

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden">

      {/* Mobile menu icon */}
      <CgMenuRight
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
        onClick={() => setHam(true)}
      />

      {/* Mobile menu */}
      <div
        className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${
          ham
            ? "translate-x-0"
            : "translate-x-full"
        } transition-transform`}
      >
        <RxCross1
          className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHam(false)}
        />

        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px]"
          onClick={handleLogOut}
        >
          Log Out
        </button>

        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px] px-[20px] py-[10px]"
          onClick={() =>
            navigate("/customize")
          }
        >
          Customize your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>

        <h1 className="text-white font-semibold text-[19px]">
          History
        </h1>

        <div className="w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate">
          {userData?.history?.map(
            (his, index) => (
              <div
                key={`${his}-${index}`}
                className="text-gray-200 text-[18px] w-full h-[30px]"
              >
                {his}
              </div>
            )
          )}
        </div>
      </div>

      {/* Desktop logout */}
      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px] bg-white rounded-full cursor-pointer text-[19px]"
        onClick={handleLogOut}
      >
        Log Out
      </button>

      {/* Desktop customize */}
      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block"
        onClick={() =>
          navigate("/customize")
        }
      >
        Customize your Assistant
      </button>

      {/* Assistant image */}
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="h-full object-cover"
        />
      </div>

      {/* Assistant name */}
      <h1 className="text-white text-[18px] font-semibold">
        I'm {userData?.assistantName}
      </h1>

      {/* User / AI animation */}
      {!aiText && (
        <img
          src={userImg}
          alt="User"
          className="w-[200px]"
        />
      )}

      {aiText && (
        <img
          src={aiImg}
          alt="AI"
          className="w-[200px]"
        />
      )}

      {/* Listening indicator */}
      {listening && (
        <h2 className="text-green-400 text-[16px] font-semibold">
          🎤 Listening...
        </h2>
      )}

      {/* User / AI text */}
      <h1 className="text-white text-[18px] font-semibold text-wrap text-center px-[20px]">
        {userText
          ? userText
          : aiText
          ? aiText
          : null}
      </h1>
    </div>
  );
}

export default Home;