AOS.init();

//  Work experience cards

const experiencecards = document.querySelector(".experience-cards");
const exp = [
  {
    title: "Software Development Intern",
    cardImage: "assets/images/experience-page/johndeere.jpg",
    place: "John Deere",
    time: "(May, 2022 - July 2022)",
    desp: "<li>Worked on automating the testing tools that is custom built.</li> \
           <li>Created a framework that tests all the automated testing on the application.</li>\
           <li>Key features added Logs, Test Script upon tool, created in Python language",
  },
  {
    title: "Software Developer",
    cardImage: "assets/images/experience-page/amdocs.png",
    place: "Amdocs",
    time: "(Aug 2023 - Ongoing)",
    desp: "<li>Building applications based on SpringBoot framework in Java</li>",
  }
  
];

const showCards2 = () => {
  let output = "";
  exp.forEach(
    ({ title, cardImage, place, time, desp }) =>
      (output += `        
    <div class="col gaap" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="400"> 
      <div class="card card1">
        <img src="${cardImage}" class="featured-image"/>
        <article class="card-body">
          <header>
            <div class="title">
              <h3>${title}</h3>
            </div>
            <p class="meta">
              <span class="pre-heading">${place}</span><br>
              <span class="author">${time}</span>
            </p>
            <ol>
              ${desp}
            </ol>
          </header>
        </article>
      </div>
    </div>
      `)
  );
  experiencecards.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards2);

// Volunteership Cards

const volunteership = document.querySelector(".volunteership");
const volunteershipcards = [
  {
    title: "Open Source Contributions",
    cardImage: "assets/images/experience-page/booktracker.jpg",
    place: "Open Source(Github)",
    description: 'Worked on a website that keeps track of the books you read, about to read, etc.. which contains all the login and public profiles and private option on profiles',
    link: "https://github.com/zero-to-mastery/book-tracker",
  },
  {
    title: "E-xchange",
    cardImage: "assets/images/project-page/ExChange.jpeg",
    place: "Open Source(Github)",
    description: "A E-xChange service within campus to re-use/donate/sell/buy from peer to peer with in campus(college)",
    link: "https://github.com/saivivek321/E-xchange-Project",
  },
];

const showCards = () => {
  let output = "";
  volunteershipcards.forEach(
    ({ title, cardImage, description }) =>
      (output += `        
      <div class="card volunteerCard" data-aos="fade-down" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="600" style="height: 550px;width:400px">
      
      <img src="${cardImage}" height="250" width="65" class="card-img" style="border-radius:10px">
      <div class="content">
          <h2 class="volunteerTitle">${title}</h2><br>
          <p class="copy">${description}</p></div>
      
      </div>
      `)
  );
  volunteership.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);

// Hackathon Section

const hackathonsection = document.querySelector(".hackathon-section");
const mentor = [
  {
    title: "NITW Cybsec CTF's",
    subtitle: "Participation",
    image: "assets/images/experience-page/ctf.jpg",
    desp: "Like to participate in CTF's",
    // link: "https://www.cybsec.in"
    link: "https://github.com/CybSec-NITW"
  },
  {
    title: "TheCyberhub weekly CTF's",
    subtitle: "Participation and walkthroughs",
    image: "assets/images/experience-page/Thecyberworld.png",
    desp: "participation and guiding peers in the process and creating walkthroughs for ctfs",
    link: "https://thecyberhub.org/"
  }
];

const showCards3 = () => {
  let output = "";
  mentor.forEach(
    ({ title, image, subtitle, desp, link }) =>
      (output += `  
      <div class="blog-slider__item swiper-slide">
        <div class="blog-slider__img">
            <img src="${image}" alt="">
        </div>
        <div class="blog-slider__content">
          <div class="blog-slider__title">${title}</div>
          <span class="blog-slider__code">${subtitle}</span>
          <div class="blog-slider__text">${desp}</div>
          <a href="${link}" class="blog-slider__button">Read More</a>   
        </div>
      </div>
      `)
  );
  hackathonsection.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards3);
