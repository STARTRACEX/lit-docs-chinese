import { useEffect, useState } from 'react';
import { SuperAnchor } from "godown/react";
import { stylobj } from 'powerstyl';
export default () => {
   var date = new Date();
   const [host, setHost] = useState('');
   useEffect(() => {
      setHost(window.location.host);
   }, [typeof window]);
   return (
      <footer style={stylobj`
padding: 20px;
display: flex;
justify-content: space-between;`}>
         <span>©{date.getFullYear()} {String(host)} </span>
         <SuperAnchor arrow="hand" href="https://nextra.site/">with Nextra</SuperAnchor>
      </footer>
   );
}

