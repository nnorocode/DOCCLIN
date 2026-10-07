// Clean, individually selectable crown drawings. Local top is the buccal edge;
// every crown is oriented along the reference arch rather than raster-traced.
const crowns = {
  central: {
    outline: "M-27-18 C-26-25-15-28 0-28 C15-28 26-25 27-18 C27-8 19 9 10 22 C6 28-6 28-10 22 C-19 9-27-8-27-18Z",
    anatomy: "M-25-15 Q0-23 25-15 M-21-11 Q-17 4-9 17 M21-11 Q17 4 9 17 M-9 17 Q0 12 9 17",
  },
  lateral: {
    outline: "M-23-18 C-22-26-11-28 1-27 C14-27 23-23 24-15 C24-5 15 12 7 23 C2 28-5 26-10 20 C-19 9-26-7-23-18Z",
    anatomy: "M-21-14 Q0-22 22-12 M-17-9 Q-14 7-7 17 M18-8 Q13 9 6 18 M-7 17 Q0 12 6 18",
  },
  canine: {
    outline: "M-25-10 C-23-18-9-26-2-28 C5-30 20-22 25-13 C31-2 22 15 10 24 C3 30-9 26-17 18 C-25 10-29 0-25-10Z",
    anatomy: "M-22-8 Q-10-17-1-21 Q10-18 21-10 M-1-21 L1 10 M-16 13 Q-7 8 1 10 Q9 7 17 13 M1 10 L1 21",
  },
  premolar: {
    outline: "M-27-12 C-26-23-15-29-3-27 C6-30 22-25 26-16 C32-6 28 9 23 18 C17 28 4 30-6 27 C-20 28-29 17-29 5 C-31-2-29-8-27-12Z",
    anatomy: "M-20-14 Q-9-11-3-3 L7 2 Q15-4 23-9 M-3-3 Q-8 5-16 11 M7 2 Q7 12 14 20 M-3-3 L-5-19 M-16 11 Q-4 8 7 2",
  },
  upperMolar: {
    outline: "M-28-13 C-29-23-20-28-10-26 C-3-30 6-28 11-25 C23-27 30-17 28-7 C32 3 28 14 22 19 C19 29 7 30-2 26 C-12 30-24 25-26 16 C-32 10-31-4-28-13Z",
    anatomy: "M-22-16 Q-14-12-8-3 L3 3 L17-1 L26-8 M-8-3 L-9-23 M-8-3 Q-14 4-23 9 M3 3 Q0 12-5 23 M3 3 Q11 11 20 17 M17-1 L18-19 M-20 16 Q-12 12-5 14",
  },
  lowerMolar: {
    outline: "M-28-15 C-27-25-17-29-8-26 C0-30 11-29 17-24 C28-23 31-14 28-5 C32 3 29 14 22 19 C16 29 5 30-3 26 C-14 29-25 24-26 15 C-32 7-31-6-28-15Z",
    anatomy: "M-25-2 Q-15 2-6 0 L5 3 L24 0 M-6 0 L-10-23 M5 3 L13-22 M-6 0 L-16 20 M5 3 L8 25 M-16 20 Q-9 15-1 17 M24 0 L20 17",
  },
};

export function OcclusalCrown({x,y,rx,ry,rotation,position,child,lower,selected}:{x:number;y:number;rx:number;ry:number;rotation:number;position:number;child:boolean;lower:boolean;selected:boolean}) {
  const type=position===1?"central":position===2?"lateral":position===3?"canine":!child&&position<6?"premolar":lower?"lowerMolar":"upperMolar";
  const crown=crowns[type];
  // The reference gives world-space extents: swap local axes as the arch turns.
  const radians=rotation*Math.PI/180;
  const across=Math.sqrt((rx*Math.cos(radians))**2+(ry*Math.sin(radians))**2)*.88/30;
  const depth=Math.sqrt((rx*Math.sin(radians))**2+(ry*Math.cos(radians))**2)*.88/30;
  return <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${across} ${depth})`} stroke={selected?"#257ca3":"#526977"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={crown.outline} fill={selected?"#78cdec":"#fffefd"}/>
    <path d={crown.anatomy} fill="none" strokeWidth="1.25" pointerEvents="none"/>
  </g>;
}
