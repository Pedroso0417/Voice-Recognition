// Check if the browser supports SpeechRecognition
const startButton = document.getElementById("startBtn");
const statusElement = document.getElementById("status");
const recognizedTextElement = document.getElementById("recognizedText");

// Check for browser support
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = function() {
    statusElement.querySelector("span").textContent = "Listening...";
  };

  recognition.onspeechend = function() {
    statusElement.querySelector("span").textContent = "Speech Ended";
    recognition.stop();
  };

  recognition.onerror = function(event) {
    statusElement.querySelector("span").textContent = `Error: ${event.error}`;
  };

  recognition.onresult = function(event) {
    let transcript = '';
    let confidence = 0;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript;
        confidence = event.results[i][0].confidence;
      }
    }

    recognizedTextElement.querySelector("span").textContent = transcript;

    statusElement.querySelector("span").textContent = 
      confidence > 0.7 ? "High Confidence" : "Low Confidence";
  };

  // ✅ Safe to use recognition here
  startButton.addEventListener('click', function() {
    const currentStatus = statusElement.querySelector("span").textContent;
    if (currentStatus === "Not listening" || currentStatus === "Stopped listening") {
      recognition.start();
    } else {
      recognition.stop();
      statusElement.querySelector("span").textContent = "Stopped listening";
    }
  });

} else {
  alert("Your browser does not support Speech Recognition.");
}
