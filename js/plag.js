/**
 * This script handles the drag-and-drop functionality for PDF and DOCX files,
 * extracts text from the files, and compares the text for plagiarism detection.
 * @author [Prabodh Singh]
 * @version 1.0.4
 */

// DOM element references
const checkPlagiarismButton = document.getElementById("checkplagiarism");
const resultOutput = document.getElementById("output");
const fileInputPdf = document.getElementById("fileInput1");
const fileInputDocx = document.getElementById("fileInput2");
const uploadAreaPdf = document.getElementById("uploadAreaPdf");
const uploadAreaDocx = document.getElementById("uploadAreaDocx");
const previewPdf = document.getElementById("preview1");
const previewDocx = document.getElementById("preview2");
const processingDialog = document.getElementById("processing-dialog");
const progressBar = document.getElementById("progress-bar");

// Global state variables for storing dropped files - Consider using a single object to manage file state
let uploadedFiles = {
  pdfFiles: [],
  docxFile: null,
};

/**
 * Prevents default drag and drop behavior
 * @param {Event} e - The drag event
 */
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Add event listeners for all drag and drop events
const dragEventNames = ["dragenter", "dragover", "dragleave", "drop"];
[uploadAreaPdf, uploadAreaDocx].forEach((uploadArea) => {
  dragEventNames.forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults);
  });
});

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

/**
 * Handles file upload preview generation
 * @param {FileList} files - The list of files to process
 * @param {string} previewElementId - ID of the preview container element
 */
const handleFilePreview = debounce((files, previewElement) => {
  if (!previewElement) {
    console.error(`Preview element not found.`);
    return;
  }

  // Clear previous preview content
  previewElement.innerHTML = "";

  if (!files || files.length === 0) return;

  const fragment = document.createDocumentFragment(); // Create preview table for better organization

  const table = document.createElement("table");
  table.className = "file-preview-table"; // Add table header

  const header = document.createElement("tr");
  header.innerHTML = "<th>File Name</th><th>Size</th>";
  table.appendChild(header); // Add file rows

  for (const file of files) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = file.name;
    nameCell.classList.add("word-wrap");

    const sizeCell = document.createElement("td");
    const sizeKB = (file.size / 1024).toFixed(2);
    sizeCell.textContent = `${sizeKB} KB`;

    row.appendChild(nameCell);
    row.appendChild(sizeCell);

    table.appendChild(row);
  }

  fragment.appendChild(table);
  previewElement.appendChild(fragment);
}, 300);

/**
 * Initialize drag and drop event handlers when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Handles dragover event - No changes needed, efficient and clear
   * @param {DragEvent} event - The drag event
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add("dragover");
  };
  /**
   * Handles dragleave event - No changes needed, efficient and clear
   * @param {DragEvent} event - The drag event
   */
  const handleDragLeave = (event) => {
    event.currentTarget.classList.remove("dragover");
  };
  /**
   * Handles file drop event - Refactored to use uploadedFiles object and handleFilePreview function
   * @param {DragEvent} event - The drop event
   */
  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove("dragover");
    event.currentTarget.classList.remove("dragging");

    const files = Array.from(event.dataTransfer.files);
    const uploadAreaId = event.currentTarget.id;

    if (uploadAreaId === "uploadAreaPdf") {
      const newPdfFiles = files.filter(
        (file) => file.type === "application/pdf"
      );
      uploadedFiles.pdfFiles = [
        ...(uploadedFiles.pdfFiles || []),
        ...newPdfFiles,
      ];
      handleFilePreview(uploadedFiles.pdfFiles, previewPdf);
    } else if (uploadAreaId === "uploadAreaDocx") {
      uploadedFiles.docxFile =
        files.find((file) => file.name.endsWith(".docx")) || null; // Ensure null if no docx
      handleFilePreview([uploadedFiles.docxFile].filter(Boolean), previewDocx); // Handle null docxFile correctly
    }
  };

  // Add event listeners to upload areas -  More efficient to loop and bind once
  [uploadAreaPdf, uploadAreaDocx].forEach((uploadArea) => {
    uploadArea.addEventListener("dragover", handleDragOver);
    uploadArea.addEventListener("dragleave", handleDragLeave);
    uploadArea.addEventListener("drop", handleDrop);
  });

  // File input event handlers for manual file selection - Directly use handleFilePreview
  fileInputPdf.addEventListener("change", (event) => {
    uploadedFiles.pdfFiles = [
      ...(uploadedFiles.pdfFiles || []),
      ...Array.from(event.target.files),
    ]; // Update global state
    handleFilePreview(uploadedFiles.pdfFiles, previewPdf);
  });

  fileInputDocx.addEventListener("change", (event) => {
    uploadedFiles.docxFile = event.target.files[0] || null; // Update global state, handle no file selected
    handleFilePreview([uploadedFiles.docxFile].filter(Boolean), previewDocx);
  });

  /**
   * Handle plagiarism check button click - No major changes here, good structure
   * Initiates text extraction and comparison process
   */
  checkPlagiarismButton.addEventListener("click", async () => {
    try {
      await handleExtractAndCompare(); // Renamed function for clarity
    } catch (error) {
      console.error("Plagiarism check failed:", error);
    }
  });
});

/**
 * Main handler for text extraction process - Enhanced with better error handling
 * @returns {Promise<void>}
 */
async function handleExtractAndCompare() {
  const pdfFiles = uploadedFiles.pdfFiles;
  const docxFile = uploadedFiles.docxFile;

  try {
    // Validate files upfront with proper error display
    if (!pdfFiles.length) {
      resultOutput.innerHTML =
        '<div class="error">Please upload at least one PDF file.</div>';
      return;
    }
    if (!docxFile) {
      resultOutput.innerHTML =
        '<div class="error">Please upload a .docx file.</div>';
      return;
    }

    processingDialog.showModal(); // Show dialog before processing
    progressBar.value = 0;

    await extractTextAndCompare(pdfFiles, docxFile);
  } catch (error) {
    resultOutput.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    console.error("Extraction failed:", error);
  } finally {
    processingDialog.close(); // Ensure dialog is closed even if error occurs
  }
}

/**
 * Generates an HTML summary report of the plagiarism check.
 * @param {Array<object>} results - The plagiarism check results.
 * @param {Array<File>} pdfFiles - The list of PDF files checked.
 * @param {File} docxFile - The DOCX file checked.
 * @returns {string} - HTML string for the summary report.
 */
function generateSummaryReportHTML(
  results,
  pdfFiles,
  docxFile,
  docxlength
  // docxArrayWordId
) {
  const highlightedSectionsCount = results.length;
  const pdfFileNames = pdfFiles.map((file) => file.name).join(", ");
  const docxFileName = docxFile ? docxFile.name : "N/A";
  const idSet = new Set();
  let plagiarizedWordCount = 0;

  results.forEach((item) => {
    item.Ids.forEach((id) => {
      idSet.add(id);
    });
  });

  plagiarizedWordCount = idSet.size;
  const plagiarismPercentage = parseFloat(
    ((plagiarizedWordCount / docxlength) * 100).toFixed(2)
  );

  let plagiarismLevelText = "";
  let plagiarismColor = "";

  if (plagiarismPercentage < 10) {
    plagiarismLevelText = "Low Plagiarism";
    plagiarismColor = "green";
  } else if (plagiarismPercentage < 25) {
    plagiarismLevelText = "Moderate Plagiarism";
    plagiarismColor = "orange";
  } else {
    plagiarismLevelText = "High Plagiarism";
    plagiarismColor = "red";
  }

  let summaryHTML = `
      <div class="summary-report">
        <h2>Plagiarism Check Summary</h2>
        <p><strong>DOCX File:</strong> ${docxFileName}</p>
        <p><strong>PDF Files:</strong> ${pdfFileNames}</p>
        <p><strong>Highlighted Sections Detected:</strong> ${highlightedSectionsCount}</p>
        <div class="plagiarism-percentage" style="color: ${plagiarismColor}; font-size: 1.2em; font-weight: bold; margin-top: 10px;">
          Plagiarism Level: <span style="display: inline-block; padding: 5px 10px; background-color: #f0f0f0; border-radius: 5px;">${plagiarismLevelText} (${plagiarismPercentage}%)</span>
        </div>
        <hr/>
        <h3>Detailed Highlighted Text:</h3>
      </div>
    `;

  let pdfSummary = results.map((item) => {
    let pdfName = item.file;
    let pdfColor = item.color.hex;
    // let similarWord = [];
    // docxArrayWordId.forEach((wordObj) => {
    //   if (item.Ids.includes(wordObj.id)) {
    //     similarWord.push(wordObj.content);
    //   }
    // });

    let pdfPercentage = parseFloat(
      ((item.Ids.length / docxlength) * 100).toFixed(2)
    );

    return {
      name: pdfName,
      // similarWords: similarWord,
      color: pdfColor,
      percentage: pdfPercentage,
    };
  });

  function createTable(data) {
    let tableHTML = '<table border="1" cellpadding="10">';

    // Table header
    tableHTML += "<tr><th>PDF Name</th><th>Color</th><th>Percentage</th></tr>";

    // Table rows
    data.forEach((row) => {
      tableHTML += `<tr>
            <td>${row.name}</td>
            <td style="background-color:${row.color}">${row.color}</td>
            <td>${row.percentage}%</td>
        </tr>`;
    });

    tableHTML += "</table> <br> <hr/> <br>";

    return tableHTML;
  }

  summaryHTML += createTable(pdfSummary);
  return summaryHTML;
}

/**
 * Extracts text from multiple PDF files and compares it with the text extracted from a DOCX file.
 * Updated to properly handle worker communication.
 */
async function extractTextAndCompare(pdfFiles, docxFile) {
  try {
    // Show processing feedback
    resultOutput.innerHTML =
      '<div class="processing">Processing files...</div>'; // Extract DOCX text

    let docxText = await extractDocxText(docxFile);
    let docxArray = separateWordsAndTags(convertToObjects(docxText)); // Create a worker with the correct module type

    const worker = new Worker(new URL("./plag-worker.js", import.meta.url), {
      type: "module",
    });
    if (!worker) {
      throw new Error("Failed to create worker");
    } // Set up progress updates

    let filesProcessed = 0;
    const totalFiles = pdfFiles.length;

    return new Promise((resolve, reject) => {
      worker.onmessage = function (event) {
        try {
          if (event.data.type === "progress") {
            // Update progress
            filesProcessed++;
            progressBar.value = (filesProcessed / totalFiles) * 100;
          } else if (event.data.type === "result") {
            // Process final results
            const results = event.data.results; // Now that we have results, update DocxArray with highlighted text
            const docxlength = event.data.docxLength;

            docxArray.words = addSpanTagsAndModify(docxArray.words, results);

            let highlightedTextHTML = combineWordsAndTagsInOrder(docxArray);
            const summaryReportHTML = generateSummaryReportHTML(
              results,
              pdfFiles,
              docxFile,
              docxlength
              // docxArray.words
            );

            resultOutput.innerHTML = summaryReportHTML + highlightedTextHTML;

            worker.terminate(); // Clean up worker
            resolve();
          } else if (event.data.type === "error") {
            console.error("Worker reported error:", event.data.message);
            reject(new Error(event.data.message));
          }
        } catch (error) {
          console.error("Error in worker message handler:", error);
          reject(error);
        }
      };

      worker.onerror = function (error) {
        console.error("Worker error event:", error);
        reject(new Error(`Worker error: ${error.message}`));
      };

      // Read all PDF files as ArrayBuffers before sending to worker
      Promise.all(
        pdfFiles.map(async (file) => {
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            arrayBuffer: await file.arrayBuffer(), // Convert to ArrayBuffer which can be transferred
          };
        })
      )
        .then((pdfBuffers) => {
          // Extract the ArrayBuffers for transfer
          const transferBuffers = pdfBuffers.map((pdf) => pdf.arrayBuffer); // Send the PDF file buffers and DOCX word array to the worker

          worker.postMessage(
            {
              pdfBuffers: pdfBuffers,
              docxArrayWord: docxArray.words,
              action: "process",
            },
            transferBuffers
          ); // Pass the ArrayBuffers as transfer objects
        })
        .catch((error) => {
          reject(new Error(`Failed to read PDF files: ${error.message}`));
        });
    });
  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

async function extractDocxText(file) {
  return new Promise((resolve, reject) => {
    // Simplified Promise creation
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        const result = await mammoth.convertToHtml({
          arrayBuffer: arrayBuffer,
        });
        resolve(result.value);
      } catch (error) {
        reject("Error converting DOCX to HTML: " + error.message); // More informative error
      }
    };
    reader.onerror = () => reject("Error reading file"); // Simplified error handling
    reader.readAsArrayBuffer(file);
  });
}

function convertToObjects(mammothString) {
  let id = 0;
  const result = [];

  // List of valid HTML tags based on Mammoth.js output
  const validTags = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6", // Headings
    "p", // Paragraph
    "ul",
    "ol",
    "li", // Lists
    "strong",
    "em",
    "u",
    "sup",
    "sub", // Text formatting
    "a", // Links
    "img", // Images
    "table",
    "tr",
    "td",
    "th", // Tables
    "br", // Line breaks
    "blockquote", // Blockquotes
    "pre",
    "code", // Code
  ];

  // Helper function to find the next valid tag
  function findNextValidTag(str, startPos) {
    let pos = startPos;
    while (pos < str.length) {
      if (str[pos] === "<") {
        const potentialTagEnd = str.indexOf(">", pos);
        if (potentialTagEnd !== -1) {
          const tagContent = str.substring(pos, potentialTagEnd + 1);
          const tagMatch = tagContent.match(/^<\/?([a-zA-Z0-9]+)/);
          if (tagMatch && validTags.includes(tagMatch[1])) {
            return pos;
          }
        }
      }
      pos++;
    }
    return -1;
  }

  // Helper function to process a single string
  function processString(str) {
    const result = [];
    let currentPosition = 0;

    while (currentPosition < str.length) {
      if (str[currentPosition] === "<") {
        const nextValidTagPos = findNextValidTag(str, currentPosition);

        if (nextValidTagPos === currentPosition) {
          // We're at a valid tag
          const tagEnd = str.indexOf(">", currentPosition);
          const tagContent = str.substring(currentPosition, tagEnd + 1);
          // const tagMatch = tagContent.match(/^<\/?([a-zA-Z0-9]+)/);

          const tagObject = {
            id: id++,
            type: "tag",
            content: tagContent,
            // tagName: tagMatch[1],
          };

          result.push(tagObject);
          currentPosition = tagEnd + 1;
        } else if (nextValidTagPos === -1) {
          // No more valid tags, treat rest as text
          const words = str
            .substring(currentPosition)
            .split(" ")
            .filter((word) => word.length > 0);
          words.forEach((word) => {
            result.push({
              id: id++,
              type: "word",
              content: word,
            });
          });
          break;
        } else {
          // Text until next valid tag
          const textContent = str.substring(currentPosition, nextValidTagPos);
          const words = textContent
            .split(" ")
            .filter((word) => word.length > 0);
          words.forEach((word) => {
            result.push({
              id: id++,
              type: "word",
              content: word,
            });
          });
          currentPosition = nextValidTagPos;
        }
      } else {
        // Handle regular text until next '<'
        const nextTag = str.indexOf("<", currentPosition);
        const wordEnd = nextTag === -1 ? str.length : nextTag;

        const words = str
          .substring(currentPosition, wordEnd)
          .split(" ")
          .filter((word) => word.length > 0);

        words.forEach((word) => {
          result.push({
            id: id++,
            type: "word",
            content: word,
          });
        });

        currentPosition = wordEnd;
      }
    }

    return result;
  }
  // Process each item in the input array

  const objects = processString(mammothString);
  result.push(...objects);

  return result;
}

function separateWordsAndTags(inputArray) {
  const words = [];
  const tags = [];

  inputArray.forEach((item) => {
    if (item.type === "word") {
      words.push({
        id: item.id,
        content: item.content,
        modified: false,
        // color: "white",
      });
    } else if (item.type === "tag") {
      tags.push({ id: item.id, content: item.content });
    }
  });

  return { words, tags };
}

function addSpanTagsAndModify(array, allResults) {
  return array.map((item) => {
    // Check if any result's Ids contain this item's id
    const matchingResult = allResults.find(
      (result) => result.Ids.includes(item.id) && !item.modified
    );

    if (matchingResult) {
      // Wrap the content in a span tag with the color from the matching result
      const modifiedContent = `<span style="background-color: ${matchingResult.color.hex}">${item.content}</span>`;
      return {
        ...item,
        content: modifiedContent,
        modified: true,
        // color: matchingResult.color.name,``
      };
    }
    return item; // Return the item unchanged if no matching result or already modified
  });
}

function combineWordsAndTagsInOrder(data) {
  // Combine words and tags into a single array
  const combined = [...data.words, ...data.tags]; // Sort by id

  combined.sort((a, b) => a.id - b.id); // Initialize result array

  let result = [];

  for (let i = 0; i < combined.length; i++) {
    const currentItem = combined[i];
    const nextItem = combined[i + 1]; // Add the current item's content

    result.push(currentItem.content); // Add space if: // 1. This is not the last item // 3. Next item is also a word // 4. Current item's content is not a single character (like '/')

    if (nextItem) {
      result.push(" ");
    }
  } // Join the final array

  return result.join("");
}
