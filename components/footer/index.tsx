import { SuperAnchor } from "godown/react";
import { css } from 'powerstyl';
export default () => {
   return <footer style={css`
padding: 20px;
display: flex;
justify-content: space-between;
color: rgba(250,251,252,.6);
`}>
      <span>©{new Date().getFullYear()} STARTRACEX</span>
      <SuperAnchor arrow="hand" href="https://nextra.site/">With Nextra</SuperAnchor>
   </footer>;
}

