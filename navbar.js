/* ==========================================
NAVBAR.JS
Create New File
navbar.js
========================================== */

const menuBtn=document.getElementById("menuBtn");

const closeMenu=document.getElementById("closeMenu");

const sidebar=document.getElementById("sidebar");

const overlay=document.getElementById("overlay");

/* ==========================================
OPEN MENU
========================================== */

function openSidebar(){

sidebar.classList.add("active");

overlay.classList.add("active");

document.body.style.overflow="hidden";

}

/* ==========================================
CLOSE MENU
========================================== */

function closeSidebar(){

sidebar.classList.remove("active");

overlay.classList.remove("active");

document.body.style.overflow="auto";

}

/* ==========================================
EVENTS
========================================== */

if(menuBtn){

menuBtn.addEventListener("click",openSidebar);

}

if(closeMenu){

closeMenu.addEventListener("click",closeSidebar);

}

if(overlay){

overlay.addEventListener("click",closeSidebar);

}

/* ==========================================
ESC KEY
========================================== */

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

closeSidebar();

}

});