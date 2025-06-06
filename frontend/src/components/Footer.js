import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        &copy; {new Date().getFullYear()} StudyFlow &mdash; Made with ❤️ by Varaanjan 
      </div>
      <div className={styles.links}>
        <a href="https://github.com/Vara-Anjan-B/studyflow" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
    </footer>
  );
}