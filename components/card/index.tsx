import Link from "next/link";
import styles from './card.module.css';
/* 
   通过t="..."设置标题
   传入s将会使标题转换小写并将空格替换为"-",然后与"/start"拼接
   传入h="..."将会设置新的url，与标题无关
*/
export function Card (props) {
   const Title: string = typeof props.t == "undefined" ? "/" : String(props.t).toLowerCase().replaceAll(" ", "-");
   const h: string = typeof props.h == "undefined" ? Title : String(props.h);
   let p: string;
   if (typeof props.s == "undefined") {
      p = typeof props.p == "undefined" ? "" : "/" + props.p;
   } else {
      p = "/start";
   }
   return <>
      <Link href={"/" + h + p} className={styles.card}>
         {props.t}
      </Link>
   </>;
}

export default function Cards() {
   return <>
      <Card t="Godown" s />
      <Card t="SimplerMongo" s />
      <Card t="MDSiteBuilder" s />
   </>;
}