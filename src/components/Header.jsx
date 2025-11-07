import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import congressData from '../data/congressData.json';
import './Header.css';

const Header = () => {
  const contractAddress = "HKT6SdF66m7oefmfQnEsX9yCMYZNF7EfvfVe477Rpump";
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [countdown, setCountdown] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format the last updated date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate next scheduled update (Sunday at 3 AM UTC)
  const getNextUpdateTime = () => {
    const now = new Date();
    const nextUpdate = new Date(now);

    // Set to next Sunday
    const daysUntilSunday = (7 - now.getUTCDay()) % 7;
    nextUpdate.setUTCDate(now.getUTCDate() + (daysUntilSunday || 7));

    // Set to 3 AM UTC
    nextUpdate.setUTCHours(3, 0, 0, 0);

    // If it's already past 3 AM UTC on Sunday, move to next week
    if (nextUpdate <= now) {
      nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 7);
    }

    return nextUpdate;
  };

  // Format countdown
  const formatCountdown = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Update countdown every second when hovering
  useEffect(() => {
    if (!isHovering) return;

    const updateCountdown = () => {
      const nextUpdate = getNextUpdateTime();
      const now = new Date();
      const diff = nextUpdate - now;
      setCountdown(formatCountdown(diff));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <>
      <div className="header-nav-left">
        <button
          onClick={copyToClipboard}
          className="ca-button"
          title="Click to copy contract address"
        >
          {copied ? 'COPIED!' : `CA:${contractAddress}`}
        </button>
        <div
          className="last-updated-container"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <span className="last-updated">
            Last Updated: {formatDate(congressData.lastUpdated)}
          </span>
          <span className={`countdown-text ${isHovering ? 'show' : ''}`}>
            Next update in: {countdown}
          </span>
        </div>
      </div>
      <div className="header-nav">
        <a
          href="https://x.com/WAJ_dotcom"
          target="_blank"
          rel="noopener noreferrer"
          className="x-link"
        >
          <img src="/x-logo.svg" alt="X" className="x-logo" />
        </a>
        <Link to="/about" className="about-link">
          ABOUT
        </Link>
        <Link to="/comments" className="comments-link">
          COMMENT BOARD
        </Link>
        <Link to="/company-profit" className="company-profit-link">
          COMPANY PROFIT
        </Link>
        <Link to="/aid-timeline" className="aid-timeline-link">
          AID TIMELINE
        </Link>
      </div>
    </>
  );
};

export default Header;
