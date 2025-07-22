let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const status = document.getElementById('status');
    const result = document.getElementById('result');

    startBtn.onclick = async () => {
      if (isRecording) return;
      isRecording = true;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          status.textContent = 'Uploading audio...';

          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

          const response = await fetch('https://api.assemblyai.com/v2/upload', {
            method: 'POST',
            headers: {
              'authorization': 'b5b3ebd82e53476e9acbfc35ab12f7ff'
            },
            body: audioBlob
          });

          if (!response.ok) {
            console.error('Upload failed:', await response.text());
            status.textContent = 'Upload failed!';
            return;
          }

          const uploadRes = await response.json();
          const audioUrl = uploadRes.upload_url;

          const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
            method: 'POST',
            headers: {
              'authorization': 'b5b3ebd82e53476e9acbfc35ab12f7ff',
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              audio_url: audioUrl,
              speaker_labels: true,
              entity_detection: true,
              iab_categories: true,
              sentiment_analysis: true,
              auto_chapters: true,
              summarization: false
            })
          });

          const transcriptData = await transcriptRes.json();

          let polling = true;
          while (polling) {
            await new Promise(res => setTimeout(res, 3000));
            const pollingRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
              headers: {
                'authorization': 'b5b3ebd82e53476e9acbfc35ab12f7ff'
              }
            });

            const data = await pollingRes.json();

            if (data.status === 'completed') {
              const voiceType = detectVoiceType(data.text);
              result.textContent = `Result: ${voiceType}`;
              status.textContent = 'Done.';
              polling = false;
            } else if (data.status === 'error') {
              status.textContent = 'Error in processing.';
              polling = false;
            }
          }
        };

        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        status.textContent = 'Recording...';

      } catch (error) {
        console.error('Could not start recording:', error);
        status.textContent = 'Microphone access denied or error occurred.';
        isRecording = false;
      }
    };

    stopBtn.onclick = () => {
      if (!isRecording || mediaRecorder.state !== 'recording') return;

      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      isRecording = false;
    };

    // Enhanced Voice Type Detection
    function detectVoiceType(text) {
      const lowerText = text.toLowerCase();

      const animalKeywords = ['bark', 'meow', 'moo', 'roar', 'chirp', 'growl'];
      const maleKeywords = ['sir', 'man', 'he', 'his', 'dude', 'bro'];
      const femaleKeywords = ['ma’am', 'woman', 'she', 'her', 'girl', 'lady'];

      for (const animal of animalKeywords) {
        if (lowerText.includes(animal)) {
          return 'Detected: Animal Voice';
        }
      }

      const isHuman = lowerText.match(/\b(hello|hi|good morning|yes|no|thanks|how are you)\b/);
      const maleDetected = maleKeywords.some(k => lowerText.includes(k));
      const femaleDetected = femaleKeywords.some(k => lowerText.includes(k));

      if (isHuman) {
        if (maleDetected && !femaleDetected) {
          return 'Detected: Human Voice (Male)';
        } else if (femaleDetected && !maleDetected) {
          return 'Detected: Human Voice (Female)';
        } else {
          return 'Detected: Human Voice (Unspecified Gender)';
        }
      }

      return 'Detected: Unknown Voice Type';
    }





// let mediaRecorder;
// let audioChunks = [];
// let isRecording = false;

// const startBtn = document.getElementById('startBtn');
// const stopBtn = document.getElementById('stopBtn');
// const status = document.getElementById('status');
// const result = document.getElementById('result');

// startBtn.onclick = async () => {
//   if (isRecording) return; // prevent double-recording
//   isRecording = true;

//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorder = new MediaRecorder(stream);
//     audioChunks = [];

//     mediaRecorder.ondataavailable = event => {
//       audioChunks.push(event.data);
//     };

//     mediaRecorder.onstop = async () => {
//       status.textContent = 'Uploading audio...';

//       const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

//       const response = await fetch('https://api.assemblyai.com/v2/upload', {
//         method: 'POST',
//         headers: {
//           'authorization': 'b5b3ebd82e53476e9acbfc35ab12f7ff'
//         },
//         body: audioBlob
//       });

//       if (!response.ok) {
//         console.error('Upload failed:', await response.text());
//         status.textContent = 'Upload failed!';
//         return;
//       }

//       const uploadRes = await response.json();
//       const audioUrl = uploadRes.upload_url;

//       const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
//         method: 'POST',
//         headers: {
//           'authorization': 'b5b3ebd82e53476e9acbfc35ab12f7ff',
//           'content-type': 'application/json'
//         },
//         body: JSON.stringify({
//           audio_url: audioUrl,
//           speaker_labels: true,
//           entity_detection: true,
//           iab_categories: true,
//           sentiment_analysis: true
//         })
//       });

//       const transcriptData = await transcriptRes.json();

//       let polling = true;
//       while (polling) {
//         await new Promise(res => setTimeout(res, 3000));
//         const pollingRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
//           headers: {
//             'authorization': 'b5b3ebd82e53476e9acbfc35ab12f7ff'
//           }
//         });

//         const data = await pollingRes.json();

//         if (data.status === 'completed') {
//           result.textContent = detectVoiceType(data.text); // uses enhanced detection
//           status.textContent = 'Done.';
//           polling = false;
//         } else if (data.status === 'error') {
//           status.textContent = 'Error in processing.';
//           polling = false;
//         }
//       }
//     };

//     mediaRecorder.start();
//     startBtn.disabled = true;
//     stopBtn.disabled = false;
//     status.textContent = 'Recording...';

//   } catch (error) {
//     console.error('Could not start recording:', error);
//     status.textContent = 'Microphone access denied or error occurred.';
//     isRecording = false;
//   }
// };
