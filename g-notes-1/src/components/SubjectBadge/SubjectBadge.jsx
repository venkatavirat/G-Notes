import React from 'react';
import './SubjectBadge.css';

const SubjectBadge = ({ subject }) => {
    return (
        <span className="subject-badge">
            {subject}
        </span>
    );
};

export default SubjectBadge;