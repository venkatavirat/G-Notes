function SubjectFilter({ selectedSubject, setSelectedSubject }) {
  return (
    <div>
      <label>Filter by subject: </label>

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
      >
        <option value="All">All Subjects</option>
        <option value="24CSEN2041">24CSEN2041</option>
        <option value="24CSEN2131">24CSEN2131</option>
        <option value="24CSEN2051">24CSEN2051</option>
        <option value="24CSEN2011">24CSEN2011</option>
        <option value="24CSEN2061">24CSEN2061</option>
      </select>
    </div>
  );
}

export default SubjectFilter;