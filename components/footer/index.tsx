import { useEffect, useState } from 'react';
import styles from './footer.module.css';
export default () => {
   var date = new Date();
   const [host, setHost] = useState('');
   useEffect(() => {
      setHost(window.location.host);
   }, [
      typeof window
   ]);
   return (
      <footer className={styles.footer}>
         <span>©{date.getFullYear()} {String(host)} </span>
         <a href="https://nextra.site/">with Nextra</a>
      </footer>
   );
}

