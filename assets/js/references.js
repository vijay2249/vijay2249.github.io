/*Reference Details Table*/
// Changes made 10/1/2021:
// Added reviewphoto1 - reviewphoto5 in assets/references-page
// Changed names and descriptions of references
const referenceTable = document.querySelector(".pain");

const references = [
    {
        sl1: 1,
        name1 : "",
        designation1 : "",
        image1 : "",
        message1 : "",
        
        
        sl2:2,
        name2 : "",
        designation2 : "",
        image2: "",
        message2 : "",
    },
];

AOS.init();
const fillData = () => {
    let output = "";
    
    references.forEach(
        ({
            sl1,
            image1,
            name1,
            designation1,
            message1,
            absbox_for_linkedin1,
            sl2,
            image2,
            name2,
            designation2,
            message2,
            absbox_for_linkedin2,
        }) =>
        (output += `<tr data-aos="zoom-in-left"> 
        <td class="imgCol"><img src="${image1}" class="rImg"></td>
        <td class = "referenceTitleName">
        <div>
        <span class="imgResponsive">
        <img src="${image1}" class="imgRes">
        </span>
        </div>
        <img src="https://img.icons8.com/fluency/48/000000/quote-left.png"/>
        <a href="#0" class="paperTitle"> ${name1} </a> 
        <div> ${designation1} </div> <div class="rConferences">  
        <div class="referenceY">${message1}</div>
        </div>  
        </td>
        </tr> 
        
        <tr data-aos="zoom-in-left"> 
        
        <td class = "referenceTitleName">
        <div>
        <span class="imgResponsive">
        <img src="${image2}" class="imgRes">
        </span>
        </div>
        <img src="https://img.icons8.com/fluency/48/000000/quote-left.png"/>
        <a href="#0" class="paperTitle">${name2} </a> 
        <div> ${designation2} </div> <div class="rConferences">
        <div class="referenceY">${message2}</div>
        </div>
        
        
        
        
        </td>
        <td class="imgCol"><img src="${image2}" class="rImg1"></td>
        </tr>`)
        );
        referenceTable.innerHTML = output;
    };
    document.addEventListener("DOMContentLoaded", fillData);
    