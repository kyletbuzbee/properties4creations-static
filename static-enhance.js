// Small enhancement script for exported static pages
(function(){
  try{
    document.documentElement.classList.add('static-enhanced');

    // Apply simple fade-up animations to elements with class 'fade-up'
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      })
    },{threshold:0.12});
    document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));

    // Improve images: add loading lazy and swap class when loaded
    document.querySelectorAll('img').forEach(img=>{
      if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
      if(!img.complete){
        img.classList.add('img-loading');
        img.addEventListener('load',()=>{
          img.classList.remove('img-loading');
        });
      }
    });

    // Add a small accessible focus outline for keyboard users
    document.body.addEventListener('keyup', (e)=>{
      if(e.key === 'Tab') document.documentElement.classList.add('show-focus-outline');
    },{once:true});
  }catch(err){console.error('Enhancement script error',err)}
})();
