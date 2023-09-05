import React, { useState } from "react";
import PizZip from "pizzip";
import { DOMParser } from "@xmldom/xmldom";
function str2xml(str) {
  if (str.charCodeAt(0) === 65279) {
    // BOM sequence
    str = str.substr(1);
  }
  return new DOMParser().parseFromString(str, "text/xml");
}
function getParagraphs(content) {
  const zip = new PizZip(content);
  const xml = str2xml(zip.files["word/document.xml"].asText());
  const textsXml = xml.getElementsByTagName("w:t");
  const textContent = Array.from(textsXml)
    .map((textXml) => textXml.textContent)
    .join("");
  // Split the text into paragraphs of up to 512 characters each, ending with ".", "?", or "!"
  const paragraphs = textContent.match(/.{1,119512}[.?!]/g) || [];
  return paragraphs;
}
const DocxReader = () => {
  const [paragraphs, setParagraphs] = useState([]);
  const onFileUpload = (event) => {
    const reader = new FileReader();
    let file = event.target.files[0];
    if (file instanceof Blob) {
      reader.onload = (e) => {
        const content = e.target.result;
        const paragraphs = getParagraphs(content);
        setParagraphs(paragraphs);
      };
      reader.onerror = (err) => console.error(err);
      reader.readAsBinaryString(file);
    } else {
      console.error("Selected file is not a valid Blob.");
    }
  };
  return (
    <div>
      <input type="file" onChange={onFileUpload} name="docx-reader" />
      <div>
        <h2>Extracted Paragraphs:</h2>
        <ul>
          {paragraphs.map((paragraph, index) => (
            <li key={index}>{paragraph}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default DocxReader;

