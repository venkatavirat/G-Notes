const SubjectFilter = ({ selectedSubject, onSelectSubject }) => {
  const subjects = [
    "All",
    "Computer Science (CSE)",
    "Information Technology (IT)",
    "Electronics (ECE)",
    "Mechanical (ME)",
    "Mathematics",
    "Physics"
  ];

  return (
    <div style={{ margin: "20px 0" }}>
      <label style={{ fontWeight: "bold", marginLeft: "20px" }}>Filter by Subject: </label>
      <select
        value={selectedSubject}
        onChange={(e) => onSelectSubject(e.target.value)}
      >
        {subjects.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectFilter;