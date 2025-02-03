import React, { useState, useEffect } from 'react';

const ChatWidget = ({ title, description, fileUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [fileContent, setFileContent] = useState('');

  // Fetch the content of the text file when the component mounts
  useEffect(() => {
    if (fileUrl) {
      fetch(fileUrl)
        .then(response => response.text())
        .then(text => setFileContent(text))
        .catch(error => console.error('Error fetching file content:', error));
    }
  }, [fileUrl]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate a bot response using OpenAI API
    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Make sure it's set in your .env file.");
      }
    
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: `Context: ${fileContent}\n\nUser: ${inputText}\n\nBot:`,
          max_tokens: 150,
          temperature: 0.7
        })
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
      }
    
      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid response from OpenAI API.");
      }
    
      const botResponse = {
        text: data.choices[0].text.trim(),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      };
    
      setMessages(prevMessages => [...prevMessages, botResponse]);
    
    } catch (error) {
      console.error("Error fetching bot response:", error.message);
    }
    
  };

  return (
    <div className="chat-container">
      {!isExpanded ? (
        <button 
          className="chat-button"
          onClick={() => setIsExpanded(true)}
        >
          {title}
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <h3>{description}</h3>
            <button 
              className="close-button"
              onClick={() => setIsExpanded(false)}
            >
              ×
            </button>
          </div>
          
          <div className="message-container">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <span className="message-text">{msg.text}</span>
                <span className="message-timestamp">{msg.timestamp}</span>
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="send-button"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .chat-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: background-color 0.3s ease;
        }

        .chat-button:hover {
          background-color: #0056b3;
        }

        .chat-window {
          width: 300px;
          height: 400px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color:rgb(241, 241, 241);
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          color: #888;
          cursor: pointer;
        }

        .message-container {
          flex-grow: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .message {
          margin-bottom: 8px;
          padding: 6px 10px;
          border-radius: 12px;
          max-width: 80%;
          font-size: 14px;
          position: relative;
        }

        .user-message {
          background-color: #007bff;
          color: white;
          align-self: flex-end;
          margin-left: auto;
        }

        .bot-message {
          background-color: #e9ecef;
          color: black;
          align-self: flex-start;
        }

        .message-text {
          display: block;
          margin-bottom: 2px;
        }

        .message-timestamp {
          font-size: 0.6em;
          opacity: 0.7;
          position: absolute;
          bottom: -12px;
          right: 0;
        }

        .input-area {
          display: flex;
          padding: 8px;
          background-color: #f1f1f1;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }

        .message-input {
          flex-grow: 1;
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-right: 8px;
          font-size: 14px;
        }

        .send-button {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .send-button:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;