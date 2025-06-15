import React from 'react';

const ProblemList = ({ problems, onToggleRevisionDone, onDeleteProblem }) => {
  if (!problems || problems.length === 0) {
    return (
      <div className="list-container">
        <h2>Problem Records</h2>
        <p>No problems recorded yet. Add one using the button above, or import from a CSV file.</p>
      </div>
    );
  }

  return (
    <div className="list-container">
      <h2>Problem Records</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Problem No./Name</th>
            <th>URL</th>
            <th>Difficulty</th>
            <th>Date Solved</th>
            <th>Note</th>
            <th>Rev. Needed?</th>
            <th>Next Revision</th>
            <th>Rev. Done?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => (
            <tr key={problem.id}>
              <td>{index + 1}</td>
              <td>{problem.problemNumber}</td>
              <td>{problem.url ? <a href={problem.url} target="_blank" rel="noopener noreferrer">Link</a> : 'N/A'}</td>
              <td>{problem.difficulty}</td>
              <td>{problem.dateSolved}</td>
              <td>{problem.userNote}</td>
              <td>{problem.revisionNeeded ? 'Yes' : 'No'}</td>
              <td>{problem.revisionNeeded ? problem.nextRevisionDate : 'N/A'}</td>
              <td className="actions-cell">
                <input
                  type="checkbox"
                  checked={problem.revisionDone}
                  onChange={() => onToggleRevisionDone(problem.id)}
                  disabled={!problem.revisionNeeded}
                />
                 {problem.revisionDone ? 'Yes' : 'No'}
              </td>
              <td className="actions-cell">
                <button onClick={() => onDeleteProblem(problem.id)} style={{backgroundColor: '#dc3545'}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemList;