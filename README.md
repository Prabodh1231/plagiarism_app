# Private Plagiarism Checker

## Video Demo:

## 🔎 Motivation

Academic writing serves as the cornerstone of scholarly communication, enabling researchers to share their findings, ideas, and recommendations with the academic community. Maintaining originality is vital to ensure credibility and integrity. To uphold these standards, plagiarism detection software is commonly used before publication.

However, access to such tools varies. While many institutions provide access to advanced plagiarism detection services, licensing restrictions often create disparities. Researchers must also review extensive literature, increasing the risk of accidental plagiarism. This tool addresses the need for an accessible, private, and effective self-assessment system.

---

## 🛠️ Project Overview

**Private Plagiarism Checker** is a **client-side plagiarism detection tool** built with **HTML**, **CSS**, and **JavaScript**. It enables users to compare a single DOCX document against a custom database of PDF files, maintaining privacy by processing data locally.

### Key Technologies:

- **PDF.js**: Extracts text from uploaded PDF files.
- **Mammoth.js**: Converts DOCX files to HTML while preserving formatting.

By combining these technologies, the tool accurately extracts, compares, and displays results.

---

## 📝 How It Works

### **Step 1: File Upload**

- **User Interface**: Two upload areas — one for DOCX files, another for PDFs.
  - Files can be uploaded via drag-and-drop or by clicking the upload buttons.
- **File Preview**: Uploaded files are displayed for confirmation before processing.

---

### **Step 2: Text Processing**

#### **DOCX Processing**

- **Conversion**: DOCX files are converted to HTML using **Mammoth.js**. The HTML preserves the document’s structure.
- **Parsing**: HTML is parsed into an array of objects with the following keys:
  - `id`: Unique identifier.
  - `type`: word or tag
  - `content`: Text content.
  - `modified`: Indicates plagiarism detection (`true/false`).

#### **Text Cleaning:**

- Text is normalized (lowercased, special characters removed).
- Segmentation using a rolling window method (currently of 12 words for efficient comparison).
- Duplicate segments are removed for optimized processing.

---

### **Step 3: PDF Processing**

- **Text Extraction**: Using **PDF.js**, the text is extracted while ignoring non-textual elements.
- **Normalization**: Follows the same cleaning and segmentation steps as the DOCX file.
- **Segmentation**: Segmentation using a rolling window method (same size as of DOCX).
- **Unique Identification**: Each PDF is assigned a unique color from a **24-color palette** for clear visualization.

---

### **Step 4: Plagiarism Detection**

- **Rolling Window Comparison**: Segmented DOCX text is compared with the segmentated PDFs.
  - Matches are identified if they meet a predefined similarity threshold (e.g., 66.66%).
  - If matches meets the threshold, IDs of the matches are stored.
- **Match Tracking**:
  - Matching segments' IDs, colors, and PDF names are stored in a result array.
  - The system updates a progress bar to display real-time processing.

---

### **Step 5: Result Presentation**

- **Match Highlighting**:
  - The DOCX document is reconstructed with highlights based on the result array.
  - Matching text segments are colored according to the assigned PDF colors.
- **Plagiarism Scores**:
  - **Overall Score**: Percentage of matched text across all PDFs.
  - **Individual Scores**: Contribution of each PDF to the overall match.
- **Detailed Report**:
  - Highlighted DOCX with matching segments.
  - The source PDFs and their matching percentages.
  - A summary of all detected matches.

## 🔧 Technical Considerations and Future Improvements

- **Expanded File Support**: Inclusion of TXT, ODT, and RTF for broader compatibility.
- **Advanced Matching Algorithms**: Use semantic analysis to detect paraphrasing.
- **Customization Options**: Adjustable similarity thresholds for diverse academic standards.

---

## 🔗 References and Resources

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Mammoth.js Documentation](https://github.com/mwilliamson/mammoth.js)
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

---
