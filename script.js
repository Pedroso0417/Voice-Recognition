// Check if the browser supports SpeechRecognition
const startButton = document.getElementById("startBtn");
const statusElement = document.getElementById("status");
const recognizedTextElement = document.getElementById("recognizedText");

// Check for browser support
let recognition;
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
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

    // Process each result in the event
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript;
        confidence = event.results[i][0].confidence;
      }
    }

    recognizedTextElement.querySelector("span").textContent = transcript;

    // For demonstration, we're showing the confidence as a rough guess
    // You can adjust this logic based on your needs
    if (confidence > 0.7) {
      statusElement.querySelector("span").textContent = "High Confidence";
    } else {
      statusElement.querySelector("span").textContent = "Low Confidence";
    }

    // If you want to classify male/female, you can use speech characteristics, but that's a separate task
  };

} else {
  alert("Your browser does not support Speech Recognition.");
}

// Start/Stop listening
startButton.addEventListener('click', function() {
  if (statusElement.querySelector("span").textContent === "Not listening") {
    recognition.start();
  } else {
    recognition.stop();
    statusElement.querySelector("span").textContent = "Stopped listening";
  }
});
