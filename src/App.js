import React, { useState, useEffect } from 'react';
import ProblemForm from './ProblemForm';
import ProblemList from './ProblemList';
import './App.css';

const LOCAL_STORAGE_KEY_PROBLEMS = 'leetcodeTrackerProblems';
const LOCAL_STORAGE_KEY_DARK_MODE = 'leetcodeTrackerDarkMode';

function App() {
  const [problems, setProblems] = useState(() => {
    const storedProblems = localStorage.getItem(LOCAL_STORAGE_KEY_PROBLEMS);
    try {
      return storedProblems ? JSON.parse(storedProblems) : [];
    } catch (error) {
      console.error("Error parsing problems from localStorage:", error);
      return [];
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem(LOCAL_STORAGE_KEY_DARK_MODE);
    return storedDarkMode ? JSON.parse(storedDarkMode) : false; // Default to light
  });

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROBLEMS, JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_DARK_MODE, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const addProblemHandler = (newProblem) => {
    setProblems((prevProblems) =>
      [...prevProblems, newProblem].sort((a, b) => new Date(b.dateSolved) - new Date(a.dateSolved))
    );
    setShowForm(false); // Hide form after adding
  };

  const toggleRevisionDoneHandler = (problemId) => {
    setProblems((prevProblems) =>
      prevProblems.map((problem) =>
        problem.id === problemId
          ? { ...problem, revisionDone: !problem.revisionDone }
          : problem
      )
    );
  };

  const deleteProblemHandler = (problemId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setProblems((prevProblems) =>
        prevProblems.filter((problem) => problem.id !== problemId)
      );
    }
  };

  const exportToCSV = () => {
    if (problems.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = [
      "Problem Number/Name", "URL", "Difficulty", "Date Solved",
      "User Note", "Revision Needed?", "Next Revision Date", "Revision Done?"
    ];
    // Function to ensure CSV field is properly quoted if it contains comma, double quote, or newline
    const escapeCSV = (field) => {
        if (field === null || field === undefined) return '';
        let str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = problems.map(p => [
      escapeCSV(p.problemNumber),
      escapeCSV(p.url),
      escapeCSV(p.difficulty),
      escapeCSV(p.dateSolved),
      escapeCSV(p.userNote),
      p.revisionNeeded ? 'Yes' : 'No',
      p.revisionNeeded ? escapeCSV(p.nextRevisionDate) : '',
      p.revisionDone ? 'Yes' : 'No'
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leetcode_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Basic CSV parser (handles quoted fields with commas and escaped quotes)
  const parseCSVToObject = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length < 1) return []; // Allow empty file or just header

    const headerLine = lines.shift().trim();
    // Regex to split CSV headers, accounts for quotes
    const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    
    const expectedHeaders = [
      "Problem Number/Name", "URL", "Difficulty", "Date Solved",
      "User Note", "Revision Needed?", "Next Revision Date", "Revision Done?"
    ];

    // Validate headers
    let validHeaders = true;
    if (headers.length !== expectedHeaders.length) {
        validHeaders = false;
    } else {
        for(let i=0; i<expectedHeaders.length; i++) {
            if (headers[i] !== expectedHeaders[i]) {
                validHeaders = false;
                break;
            }
        }
    }

    if (!validHeaders) {
        alert("CSV headers do not match the expected format or count.\nPlease ensure the CSV has the following headers in order:\n" + expectedHeaders.join(", "));
        return null; // Indicate error
    }


    const data = [];
    lines.forEach((line, index) => {
      line = line.trim();
      if (!line) return; // Skip empty lines

      // Regex to split CSV row, accounts for quotes and commas within quotes
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      if (values.length === headers.length) {
        try {
            const problem = {
                id: Date.now() + index, // Generate new ID
                problemNumber: values[headers.indexOf("Problem Number/Name")] || '',
                url: values[headers.indexOf("URL")] || '',
                difficulty: values[headers.indexOf("Difficulty")] || 'Easy',
                dateSolved: values[headers.indexOf("Date Solved")] || new Date().toISOString().slice(0,10),
                userNote: values[headers.indexOf("User Note")] || '',
                revisionNeeded: (values[headers.indexOf("Revision Needed?")] || '').toLowerCase() === 'yes',
                nextRevisionDate: values[headers.indexOf("Next Revision Date")] || '',
                revisionDone: (values[headers.indexOf("Revision Done?")] || '').toLowerCase() === 'yes',
            };
            // Basic validation for dateSolved
            if (!/^\d{4}-\d{2}-\d{2}$/.test(problem.dateSolved)) {
                console.warn(`Invalid date format for 'Date Solved' in CSV row ${index + 1}. Using today's date.`);
                problem.dateSolved = new Date().toISOString().slice(0,10);
            }
            if (problem.revisionNeeded && problem.nextRevisionDate && !/^\d{4}-\d{2}-\d{2}$/.test(problem.nextRevisionDate)) {
                 console.warn(`Invalid date format for 'Next Revision Date' in CSV row ${index + 1}. Clearing date.`);
                 problem.nextRevisionDate = '';
            }


            data.push(problem);
        } catch (e) {
            console.warn(`Skipping malformed CSV line ${index + 2}: ${line}`, e);
        }
      } else {
        console.warn(`Skipping CSV line ${index + 2} due to incorrect number of columns: ${line}`);
      }
    });
    return data;
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target.result;
        try {
          const importedProblems = parseCSVToObject(csvData);
          if (importedProblems === null) return; // Parsing error handled in parseCSVToObject

          if (importedProblems.length > 0) {
            const replace = window.confirm(`Import ${importedProblems.length} problems? This will replace all current records.`);
            if (replace) {
                setProblems(importedProblems.sort((a, b) => new Date(b.dateSolved) - new Date(a.dateSolved)));
                alert(`${importedProblems.length} problems imported successfully!`);
            }
          } else {
            alert("No valid problems found in the CSV file, or the file was empty after the header.");
          }
        } catch (error) {
          console.error("Error processing CSV:", error);
          alert("Error processing CSV file. Make sure it's correctly formatted and review console for details.");
        }
        event.target.value = null; // Reset file input
      };
      reader.readAsText(file);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className="container">
      <h1>LeetCode Problem Tracker</h1>

      <div className="controls-bar">
        <div className="file-ops">
          <input type="file" accept=".csv" onChange={importFromCSV} style={{ display: 'none' }} id="csvImporter" />
          <button onClick={() => document.getElementById('csvImporter').click()} className="import-button">Import from CSV</button>
          <button onClick={exportToCSV} className="export-button">Export to CSV</button>
        </div>
        <div className="view-ops">
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="add-new-button">
              Add New Problem Record
            </button>
          )}
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {showForm && (
        <ProblemForm
          onAddProblem={addProblemHandler}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ProblemList
        problems={problems}
        onToggleRevisionDone={toggleRevisionDoneHandler}
        onDeleteProblem={deleteProblemHandler}
      />
    </div>
  );
}

export default App;