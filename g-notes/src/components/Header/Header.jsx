import React from 'react';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">G-NOTES</div>
            <nav className="navbar">
                <ul className="nav-links">
                    <li><button className="nav-button">Home</button></li>
                    <li><button className="nav-button">About</button></li>
                    <li><button className="nav-button">Contact</button></li>
                </ul>
            </nav>
            <div className="user-avatar">
                <img src="/path/to/avatar.jpg" alt="User Avatar" />
            </div>
        </header>
    );
};

export default Header;