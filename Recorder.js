// Video Export Setup
    let mediaRecorder;
    let recordedChunks = [];

    window.addEventListener('keydown', (e) => { 
        // Existing keydown logic...
        if (e.code === 'Space') {
            ui.style.display = ui.style.display === 'block' ? 'none' : 'block'; 
        }
        if (e.code === 'ArrowUp' && !targetChroma) {
            targetChroma = true;
            chromaTransitionStart = Date.now();
        }
        if (e.code === 'ArrowDown' && targetChroma) {
            targetChroma = false;
            chromaTransitionStart = Date.now();
        }

        // --- NEW: Press 'R' to record for 60 seconds ---
        if (e.code === 'KeyR' && !mediaRecorder) {
            console.log("Recording started...");
            
            // Capture canvas at 60 FPS
            const stream = canvas.captureStream(60); 
            
            // Set up high-quality WebM encoding
            const options = { mimeType: 'video/webm; codecs=vp9' };
            try {
                mediaRecorder = new MediaRecorder(stream, options);
            } catch (err) {
                // Fallback if VP9 isn't supported
                mediaRecorder = new MediaRecorder(stream); 
            }

            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = function() {
                // Compile the video file
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Trigger download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'generative-grid-export.webm';
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                setTimeout(() => { 
                    document.body.removeChild(a); 
                    window.URL.revokeObjectURL(url); 
                }, 100);
                
                console.log("Recording saved!");
                recordedChunks = [];
                mediaRecorder = null;
            };

            mediaRecorder.start();

            // Auto-stop after exactly 60 seconds (60,000 milliseconds)
            setTimeout(() => {
                if (mediaRecorder && mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                }
            }, 60000);
        }
    });
