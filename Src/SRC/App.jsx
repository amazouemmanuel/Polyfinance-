import { useState, useRef, useEffect } from "react";

const C = {
  navy:"#1B4D6E",navyDark:"#0F2E42",navyLight:"#245f85",
  teal:"#2AABAA",tealLight:"#3ECFCE",
  orange:"#F47B2A",orangeLight:"#FF9349",
  bg:"#F5F8FA",white:"#FFFFFF",
  text:"#1a2a35",textMuted:"#6B8FA8",
  border:"rgba(27,77,110,0.12)",
};

const SUGGESTIONS = [
  {icon:"📈",label:"Investir à la BRVM",q:"Comment investir à la BRVM en Côte d'Ivoire ?"},
  {icon:"💹",label:"Débuter le trading",q:"Comment débuter dans le trading ?"},
  {icon:"📋",label:"Lire un bilan",q:"Comment lire et analyser un bilan comptable ?"},
  {icon:"📱",label:"Mobile money",q:"Quel est l'impact du mobile money sur les PME ?"},
  {icon:"₿",label:"Les cryptos",q:"C'est quoi les cryptomonnaies ?"},
  {icon:"🏦",label:"Finance islamique",q:"Explique-moi la finance islamique."},
];

const TOPICS = [
  {icon:"📊",title:"Marchés & BRVM",desc:"Bourse, actions, obligations"},
  {icon:"💹",title:"Trading",desc:"Analyse technique, scalping, swing"},
  {icon:"₿",title:"Crypto",desc:"Bitcoin, Ethereum, blockchain"},
  {icon:"📚",title:"Comptabilité",desc:"Bilan, résultat, ratios OHADA"},
  {icon:"🌍",title:"Économie africaine",desc:"UEMOA, B
