/* Cat Girl RPG - runtime translation layer (loaded only when the language is not English) */
(function(){
'use strict';
var D=window.TR_DICT||{},E=Object.create(null),P=[];
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
Object.keys(D).forEach(function(k){
  if(k.indexOf('{}')>=0){
    var parts=k.split('{}');
    P.push({re:new RegExp('^'+parts.map(esc).join('([\\s\\S]*?)')+'$'),out:D[k],n:parts.join('').length});
  }else E[k]=D[k];
});
P.sort(function(a,b){return b.n-a.n});
function fill(out,caps){var i=0;return out.replace(/\{(\d*)\}/g,function(_,n){var v=caps[n?+n-1:i++];return v==null?'':v})}
var UN=/^[+\-]\d+ (?:gold|HP|MP|Potions?)(?:, [+\-]\d+ (?:gold|HP|MP|Potions?))*\.?$/;
function T(k,d){
  var e=E[k];if(e!==undefined)return e;
  if(d>3)return k;
  if(UN.test(k)){
    var dot=k.slice(-1)==='.',toks=(dot?k.slice(0,-1):k).split(', ').map(function(t){return t.replace(/ gold$/,D['#gold']).replace(/ Potions?$/,D['#potion'])});
    return toks.join(D['#sep'])+(dot?D['#end']:'');
  }
  for(var i=0;i<P.length;i++){
    var x=P[i].re.exec(k);
    if(x){
      var caps=x.slice(1).map(function(c){
        if(!/[A-Za-z]{2}/.test(c))return c;
        var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(c);
        return m[1]+T(m[2],d+1)+m[3];
      });
      return fill(P[i].out,caps);
    }
  }
  if(k.indexOf(', ')>0){
    var ps=k.split(', '),ch=0,o=ps.map(function(x){var y=E[x];if(y!==undefined){ch=1;return y}return x});
    if(ch)return o.join(D['#list']);
  }
  return k;
}
function tr(s){
  if(typeof s!=='string')return s;
  var m=/^(\s*)([\s\S]*?)(\s*\u25bc?\s*)$/.exec(s),k=m[2];
  if(!k)return s;
  var r=T(k,0);
  return r===k?s:m[1]+r+m[3];
}
window.tr=tr;
var seen=new WeakMap();
function fixNode(n){
  var v=n.nodeValue;
  if(!v||!/[A-Za-z]/.test(v)||seen.get(n)===v)return;
  var r=tr(v);
  if(r!==v){n.nodeValue=r;seen.set(n,r)}
}
var ATT=['placeholder','title','aria-label'];
function walk(n){
  if(n.nodeType===3)return fixNode(n);
  if(n.nodeType!==1)return;
  var tg=n.tagName;
  if(tg==='SCRIPT'||tg==='STYLE')return;
  for(var i=0;i<ATT.length;i++){
    var a=ATT[i];
    if(n.hasAttribute(a)){var v=n.getAttribute(a),r=tr(v);if(r!==v)n.setAttribute(a,r)}
  }
  for(var c=n.firstChild;c;c=c.nextSibling)walk(c);
}
function start(){
  walk(document.body);
  new MutationObserver(function(ms){
    for(var i=0;i<ms.length;i++){
      var m=ms[i];
      if(m.type==='characterData')fixNode(m.target);
      else for(var j=0;j<m.addedNodes.length;j++)walk(m.addedNodes[j]);
    }
  }).observe(document.body,{childList:true,subtree:true,characterData:true});
}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
