import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import lottie from "lottie-web/build/player/lottie_light";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, DrawSVGPlugin, SplitText);
const mobile = matchMedia("(max-width: 650px)");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const animations = new Map();

function ornament(parent, kind, size) {
  const node = document.createElement("div");
  node.className = "decoration";
  node.style.width = size + "px";
  parent.append(node);
  const anim = lottie.loadAnimation({ container: node, renderer: "svg", loop: true, autoplay: false, path: "/lottie/" + kind + ".json" });
  animations.set(node, anim);
  return node;
}
function remove(node) {
  animations.get(node)?.destroy();
  animations.delete(node);
  node.remove();
}
async function dust(alive, x, y) {
  const [{ tsParticles }, { loadSlim }] = await Promise.all([import("@tsparticles/engine"), import("@tsparticles/slim")]);
  await loadSlim(tsParticles);
  if (!alive()) return;
  const container = await tsParticles.load({ id: "dust", options: {
    fullScreen: { enable: false }, fpsLimit: 30, detectRetina: false,
    particles: { number: { value: 0, density: { enable: false } }, color: { value: ["#D4AF37","#F3E2A0"] },
      size: { value: { min: 1, max: 3 } }, opacity: { value: .85 },
      move: { enable: true, speed: 2.2, direction: "none", outModes: "out" } }
  } });
  if (alive() && container) {
    const scale = container.canvas.size.width / innerWidth;
    for (let i=0;i<16;i++) container.particles.addParticle({x:x*scale,y:y*scale});
  } else container?.destroy();
  return container;
}
export function openEnvelope(done) {
  const flight = document.querySelector("#flight");
  const seal = document.querySelector(".seal").getBoundingClientRect();
  const x = seal.left + seal.width / 2, y = seal.top + seal.height / 2;
  let alive = true, particles;
  const tl = gsap.timeline({ onComplete: done });
  tl.to(".seal", { x: 3, rotation: 5, repeat: 7, yoyo: true, duration: .075 }, 0)
    .to(".seal", { scale: 1.18, opacity: 0, duration: .24 }, .56)
    .to(".paper", { opacity: 1, duration: 1.1 }, .8)
    .to(".lifted-flap", { rotationX: 161, duration: 2, ease: "power2.inOut" }, .8)
    .to(".open-actions", { opacity: 0, duration: .45 }, 0)
    .to("#gate", { opacity: 0, duration: 3 }, 3.5)
    .fromTo(".castle-art", { scale: 1.08 }, { scale: 1, duration: 3 }, 3.5);
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement("i");
    spark.className = "fragment"; flight.append(spark);
    tl.fromTo(spark, { x,y,scale:0 }, { x:x+Math.cos(i*.785)*64, y:y+Math.sin(i*.785)*64,scale:1,opacity:0,duration:.8 }, .55);
  }
  for (let i = 0; i < (mobile.matches ? 12 : 18); i++) {
    const node = ornament(flight, "mariposa", 22 + i % 5 * 6);
    const dx = (i % 2 ? 1 : -1) * innerWidth * (.23 + Math.random()*.48);
    const dy = -innerHeight*(.18 + Math.random()*.48);
    const start = 2 + i % 6 * .16;
    tl.set(node, { left:x, top:y,opacity:0 }, 0)
      .call(() => animations.get(node)?.play(), [], start)
      .to(node, { opacity:1,duration:.22 }, start)
      .to(node, { duration:2.3, motionPath:{ path:[{x:dx*.22,y:dy*.6},{x:dx*.64,y:dy*.48},{x:dx,y:dy}],curviness:1.6 } }, start)
      .to(node, { opacity:0,duration:.5 }, start+1.8);
  }
  const rising = ornament(flight,"farol",46);
  tl.set(rising,{left:"73%",top:"84%",opacity:0},0)
    .call(()=>animations.get(rising)?.play(),[],2)
    .to(rising,{opacity:.8,duration:.5},2).to(rising,{y:-innerHeight*.35,duration:4},2)
    .to(rising,{opacity:0,duration:.5},5.5);
  tl.call(() => { dust(() => alive, x, y).then(value => { particles = value; }); }, [], 2);
  return () => {
    alive=false; tl.kill(); particles?.destroy();
    Array.from(flight.children).forEach(remove);
    gsap.set(".castle-art",{clearProps:"transform"});
  };
}

export function decorate() {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = new Lenis({ anchors:true });
    const tick = seconds => { if (!document.hidden) lenis.raf(seconds*1000); };
    gsap.ticker.add(tick); lenis.on("scroll", ScrollTrigger.update);
    const split = SplitText.create("h1 b, h1>span", {type:"chars",charsClass:"gold-char"});
    split.chars.forEach((c,i)=>{ c.dataset.letter=c.textContent; c.style.setProperty("--delay",i*.085+"s"); });
    gsap.from(split.chars,{opacity:0,y:12,duration:.5,stagger:.045});
    const view = new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle("offscreen",!e.isIntersecting)));
    document.querySelectorAll("header,section").forEach(node=>view.observe(node));
    document.querySelectorAll(".reveal").forEach(node=>gsap.from(node,{opacity:0,y:22,scale:.985,duration:.65,scrollTrigger:{trigger:node,start:"top 96%",once:true}}));
    document.querySelectorAll(".divider-wrap path").forEach(path=>gsap.from(path,{drawSVG:"0%",duration:1.3,scrollTrigger:{trigger:path,start:"top 96%",once:true}}));
    [".castle-art",".hills",".flowers"].forEach((selector,i)=>gsap.to(selector,{y:16+i*12,ease:"none",scrollTrigger:{trigger:"#cover",start:"top top",end:"bottom top",scrub:true}}));
    const air=document.querySelector("#air");
    const decorations=[];
    for(let i=0;i<6;i++){
      const mote=document.createElement("i");
      mote.className="firefly";
      mote.style.left=(5+i*18)+"%";
      air.append(mote); decorations.push(mote);
      gsap.fromTo(mote,{y:10,opacity:0},{y:-innerHeight*.92,x:25,opacity:.65,duration:12+i,repeat:-1,delay:-i*2,ease:"sine.inOut"});
    }
    for(let i=0;i<3;i++){
      const node=ornament(air,"farol",25+i*9); decorations.push(node);
      gsap.set(node,{left:[4,88,14][i]+"%",opacity:.42});
      gsap.fromTo(node,{y:innerHeight+60},{y:-80,x:24,duration:22+i*5,repeat:-1,ease:"none",delay:-i*8,
        onUpdate(){const rect=node.getBoundingClientRect();const anim=animations.get(node);if(rect.bottom>0&&rect.top<innerHeight&&!document.hidden)anim?.play();else anim?.pause();}});
    }
    const fly=ornament(air,"mariposa",37); decorations.push(fly);gsap.set(fly,{opacity:0});
    let last=-10000;
    function flutter(){
      if(performance.now()-last<12000)return;last=performance.now();
      animations.get(fly)?.play();gsap.set(fly,{x:-50,y:innerHeight*.55,opacity:.85});
      gsap.to(fly,{motionPath:{path:[{x:innerWidth*.3,y:innerHeight*.44},{x:innerWidth*.65,y:innerHeight*.5},{x:innerWidth+50,y:innerHeight*.25}]},duration:6,onComplete:()=>animations.get(fly)?.pause()});
    }
    lenis.on("scroll",flutter);
    ScrollTrigger.create({trigger:"#confirmacion",start:"top 80%",once:true,onEnter:async()=>{
      const {confetti}=await import("@tsparticles/confetti");
      if(!reduced.matches) confetti({count:mobile.matches?22:36,spread:74,colors:["#D4AF37","#C9B1E8","#F3E2A0"],disableForReducedMotion:true,position:{x:50,y:72},ticks:95});
    }});
    ScrollTrigger.refresh();
    return ()=>{gsap.ticker.remove(tick);lenis.destroy();view.disconnect();split.revert();decorations.forEach(remove);};
  });
}
