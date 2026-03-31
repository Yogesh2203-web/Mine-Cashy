document.addEventListener("DOMContentLoaded", function(){

  const nav = document.getElementById("bottomNav");
  if(!nav) return;

  const indicator = document.getElementById("navIndicator");
  const links = nav.querySelectorAll(".nav-link");

  function getPosition(el){
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.left - navRect.left;
  }

let path = location.pathname.split("/").pop();

if(path === "" || path === "/"){
  path = "index.html"; // 🔥 your new home page
}

const currentPage = path;

  let activeLink = null;

  links.forEach(link=>{
    if(link.getAttribute("href") === currentPage){
      activeLink = link;
    }
  });

  /* INITIAL POSITION (NO FLASH) */
  if(activeLink){
    indicator.style.transition = "none";
    indicator.style.transform =
      `translateX(${getPosition(activeLink)}px)`;

    activeLink.classList.add("active");

    setTimeout(()=>{
      indicator.style.transition =
        "transform .45s cubic-bezier(.34,1.56,.64,1)";
    },50);
  }

  /* CLICK ANIMATION */
  links.forEach(link=>{
    link.addEventListener("click", function(e){

      if(this.getAttribute("href") === currentPage){
        return;
      }

      e.preventDefault();

      indicator.style.transform =
        `translateX(${getPosition(this)}px)`;

      links.forEach(l=>l.classList.remove("active"));
      this.classList.add("active");

      setTimeout(()=>{
        window.location.href =
          this.getAttribute("href");
      },400);

    });
  });

});
