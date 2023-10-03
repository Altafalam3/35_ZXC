import React, { useState, useRef } from "react";
import "./Textsummarizer.css";
import axios from "axios";

function Textsummarizer() {
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const [pdfFile, setPdfFile] = useState(null);
  const handlePDFChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const clearText = () => {
    setInputText("");
    setOutputText("");
  };

  const summarizeText = async () => {
    const textToSummarize = inputText.trim();

    if (textToSummarize === "") {
      window.alert("Enter some text to summarize");
      return;
    }

    setIsLoading(true); // Start loading

    // Send the text to your Flask API for summarization
    try {
      const response = await axios.post("http://127.0.0.1:5000/summarize", {
        article: textToSummarize,
      });
      const { summary } = response.data;
      setOutputText(summary);
    } catch (error) {
      console.error("Error summarizing text:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const summarizeDoc = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    if (!pdfFile) {
      window.alert("Select a PDF file to summarize");
      return;
    }

    setIsLoading(true); // Start loading

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setOutputText(data.summary);
      console.log(data.summary);
      console.log("PDF file sent successfully");
    } catch (error) {
      console.error("Error summarizing PDF:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="container mt-5">
      <h1>Text Summarizer</h1>

      <form onSubmit={summarizeDoc}
        encType="multipart/form-data">
        <div className="form-group mt-3">
          <textarea
            className="form-control ta"
            rows="10"
            placeholder="Enter text here . . . "
            value={inputText}
            onChange={handleInputChange}
          ></textarea>
          <div className="my-4 uploads">
            <label htmlFor="myfile" className="mx-4">
              <u>Select a file (PDF format):</u>
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf"
              onChange={handlePDFChange}
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary my-4"
            id="summarize-btn"
            onClick={summarizeText}
          >
            {isLoading ? "Summarizing..." : "Summarize Text"}
          </button>

          <button
            type="button"
            className="btn btn-primary my-4 mx-5"
            id="send-btn"
            onClick={summarizeDoc}
          >
            {isLoading ? "Summarizing..." : "Summarize Doc"}
          </button>

          <button
            type="button"
            className="btn btn-secondary my-4 mx-2"
            id="clear-btn"
            onClick={clearText}
          >
            Clear
          </button>
        </div>
      </form>

      <h2>Summarized Text:</h2>
      <br />

      <div className="summarized-text mt-3">
        {outputText && <p>{outputText}</p>}
      </div>
    </div>
  );
}

export default Textsummarizer;
