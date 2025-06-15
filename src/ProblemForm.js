import React, { useState, useEffect } from 'react';

const ProblemForm = ({ onAddProblem, onCancel }) => { // Added onCancel
  const getTodayPlus7Days = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().slice(0, 10);
  };

  const [problemNumber, setProblemNumber] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [dateSolved, setDateSolved] = useState(new Date().toISOString().slice(0, 10));
  const [userNote, setUserNote] = useState('');
  const [revisionNeeded, setRevisionNeeded] = useState(false);
  const [nextRevisionDate, setNextRevisionDate] = useState('');

  // Effect to manage nextRevisionDate based on revisionNeeded
  useEffect(() => {
    if (revisionNeeded) {
      // If revision is needed and nextRevisionDate is currently empty,
      // set it to default (today + 7 days).
      // This allows the user to manually change it later, and it won't be overridden
      // by this effect unless revisionNeeded is toggled off and then on again.
      if (nextRevisionDate === '') {
        setNextRevisionDate(getTodayPlus7Days());
      }
    } else {
      // If revision is not needed, clear the nextRevisionDate.
      setNextRevisionDate('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionNeeded]); // Intentionally not including nextRevisionDate to allow manual edits.

  const resetForm = () => {
    setProblemNumber('');
    setUrl('');
    setDifficulty('Easy');
    setDateSolved(new Date().toISOString().slice(0, 10));
    setUserNote('');
    setRevisionNeeded(false);
    // nextRevisionDate will be cleared by the useEffect when revisionNeeded becomes false
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problemNumber.trim()) {
      alert("Problem Number/Name is required.");
      return;
    }
    onAddProblem({
      id: Date.now(),
      problemNumber,
      url,
      difficulty,
      dateSolved,
      userNote,
      revisionNeeded,
      nextRevisionDate: revisionNeeded ? nextRevisionDate : '',
      revisionDone: false,
    });
    resetForm(); // Reset form fields after successful submission
  };

  return (
    <div className="form-container">
      <h2>Add New LeetCode Problem</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Problem Number/Name:</label>
          <input type="text" value={problemNumber} onChange={(e) => setProblemNumber(e.target.value)} required />
        </div>
        <div>
          <label>URL:</label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div>
          <label>Difficulty:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label>Date Solved:</label>
          <input type="date" value={dateSolved} onChange={(e) => setDateSolved(e.target.value)} required />
        </div>
        <div>
          <label>User Note:</label>
          <textarea value={userNote} onChange={(e) => setUserNote(e.target.value)} rows="3"></textarea>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={revisionNeeded}
              onChange={(e) => setRevisionNeeded(e.target.checked)}
            />
            Revision Needed?
          </label>
        </div>
        {revisionNeeded && (
          <div>
            <label>Next Revision Date:</label>
            <input
              type="date"
              value={nextRevisionDate}
              onChange={(e) => setNextRevisionDate(e.target.value)}
              required={revisionNeeded}
            />
          </div>
        )}
        <button type="submit">Add Problem</button>
        <button type="button" onClick={onCancel} style={{marginLeft: '10px', backgroundColor: '#6c757d'}}>Cancel</button>
      </form>
    </div>
  );
};

export default ProblemForm;