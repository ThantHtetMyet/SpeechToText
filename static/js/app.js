document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const transcription = document.getElementById('transcription');
    const statusLed = document.getElementById('statusLed');
    const statusText = document.getElementById('statusText');
    const correctBtn = document.getElementById('correctBtn');
    const incorrectBtn = document.getElementById('incorrectBtn');

    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    // Add wave visualization container after the transcription textarea
    // Create status container for better alignment
    const statusContainer = document.createElement('div');
    statusContainer.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        gap: 15px;
    `;

    // Move statusLed and statusText into the container
    const statusWrapper = document.createElement('div');
    statusWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    statusWrapper.appendChild(statusLed);
    statusWrapper.appendChild(statusText);

    // Modify wave container to be smaller and fit beside status
    const waveContainer = document.createElement('div');
    waveContainer.id = 'waveVisualization';
    waveContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 2px;
        height: 30px;
    `;
    
    // Create smaller wave bars
    for (let i = 0; i < 8; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.cssText = `
            width: 3px;
            height: 15px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            border-radius: 3px;
            transition: height 0.2s ease;
        `;
        waveContainer.appendChild(bar);
    }

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        margin-top: 20px;
    `;
    buttonContainer.appendChild(startBtn);
    buttonContainer.appendChild(stopBtn);

    // Update the DOM structure
    statusContainer.appendChild(statusWrapper);
    statusContainer.appendChild(waveContainer);
    transcription.parentNode.insertBefore(statusContainer, transcription);
    transcription.parentNode.insertBefore(buttonContainer, transcription.nextSibling);

    // Update wave animation styles (remove the duplicate waveStyles declaration)
    const waveStyles = document.createElement('style');
    waveStyles.textContent = `
        @keyframes wave {
            0% { height: 15px; }
            50% { height: 25px; }
            100% { height: 15px; }
        }
        
        .wave-bar.active {
            animation: wave 1s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.1s);
        }
        
        #transcription {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 20px;
            font-size: 16px;
            min-height: 150px;
            width: 100%;
            box-sizing: border-box;
            resize: none;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        #transcription:focus {
            border-color: #4CAF50;
            box-shadow: 0 5px 20px rgba(76,175,80,0.15);
            outline: none;
        }
        
        #startBtn, #stopBtn {
            padding: 12px 30px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
        }
        
        #startBtn {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }
        
        #stopBtn {
            background: linear-gradient(135deg, #ff4b4b 0%, #ff3333 100%);
        }
        
        #startBtn:hover, #stopBtn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        #startBtn:disabled, #stopBtn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        #statusLed {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 10px;
            transition: background-color 0.3s ease;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(waveStyles);

    // Move button event handlers here, after all elements are created
    startBtn.onclick = function() {
        transcription.value = '';
        recognition.start();
    };

    stopBtn.onclick = function() {
        recognition.stop();
    };

    correctBtn.onclick = () => submitFeedback(true);
    incorrectBtn.onclick = () => {
        document.getElementById('actualTextInput').value = '';
        document.getElementById('feedbackModal').style.display = 'block';
    };

    // Update recognition handlers to animate wave
    recognition.onstart = function() {
        statusLed.style.backgroundColor = '#00ff00';
        statusText.textContent = 'Listening';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        // Start wave animation
        const bars = document.querySelectorAll('.wave-bar');
        bars.forEach((bar, index) => {
            bar.style.setProperty('--i', index);
            bar.classList.add('active');
        });
    };

    recognition.onend = function() {
        statusLed.style.backgroundColor = 'gray';
        statusText.textContent = 'Not Listening';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        // Stop wave animation
        const bars = document.querySelectorAll('.wave-bar');
        bars.forEach(bar => bar.classList.remove('active'));
    };

    recognition.onresult = function(event) {
        statusLed.style.backgroundColor = '#ffff00';
        statusText.textContent = 'Processing';
        
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + '\n';
            }
        }
        
        if (finalTranscript) {
            transcription.value += finalTranscript;
            statusLed.style.backgroundColor = '#00ff00';
            statusText.textContent = 'Listening';
        }
    };

    // Add modal HTML to the document
    const modalHTML = `
        <div id="feedbackModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
            <div style="position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 500px; text-align: center; box-shadow: 0 15px 30px rgba(0,0,0,0.2);">
                <div style="font-size: 40px; margin-bottom: 20px;">🗣️</div>
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">What was actually said? 🤔</h3>
                <textarea id="actualTextInput" style="width: 100%; height: 120px; margin: 10px 0; padding: 15px; border: 2px solid #e0e0e0; border-radius: 15px; font-size: 16px; resize: none; transition: all 0.3s ease; box-sizing: border-box;"></textarea>
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 25px;">
                    <button onclick="submitActualText()" style="padding: 12px 30px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">✅</span> Submit
                    </button>
                    <button onclick="closeModal()" style="padding: 12px 30px; background: linear-gradient(135deg, #ff4b4b 0%, #ff3333 100%); color: white; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">❌</span> Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add success modal HTML
    const successModalHTML = `
        <div id="successModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
            <div style="position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 30px; border-radius: 15px; width: 400px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px;">Feedback Recorded!</h3>
                <p style="margin: 0 0 30px 0; color: #666; font-size: 16px;">Thank you for your feedback</p>
                <button onclick="closeSuccessModal()" style="padding: 12px 30px; background-color: #4CAF50; color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">OK</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', successModalHTML);

    // Add modal functions to window scope
    window.closeModal = function() {
        document.getElementById('feedbackModal').style.display = 'none';
    };

    window.closeSuccessModal = function() {
        document.getElementById('successModal').style.display = 'none';
    };

    // Add the missing submitActualText function
    window.submitActualText = function() {
        const actualText = document.getElementById('actualTextInput').value;
        if (!actualText.trim()) {
            alert('Please enter the actual text');
            return;
        }
        submitFeedback(false, actualText);
        closeModal();
    };

    function showSuccessModal() {
        document.getElementById('successModal').style.display = 'block';
        setTimeout(closeSuccessModal, 2000); // Auto close after 2 seconds
    }

    function submitFeedback(isCorrect, actualText = null) {
        fetch('/submit_feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                spokenText: transcription.value,
                isCorrect: isCorrect,
                actualText: actualText
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                showSuccessModal();
                transcription.value = ''; // Clear the transcription after feedback
            } else {
                throw new Error(data.message || 'Error saving feedback');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving feedback: ' + error.message);
        });
    }
});