/* ==========================================
ZM LABEL
HOODIES PAGE
BACKEND
========================================== */

const API_URL = "http://localhost:5000/api/products";


let allProducts = [];

let filteredProducts = [];

document.addEventListener("DOMContentLoaded", () => {

loadProducts();

setupMobileMenu();

setupFilterSidebar();

});

/* ==========================================
LOAD PRODUCTS
========================================== */
async function loadProducts(){

    try{

        const res = await fetch(API_URL);

        const data = await res.json();

        console.log("All Products:", data.products);

        // Sirf Hoodies category ke products
      allProducts = (data.products || []).filter(product => {

    const category = String(
        product.category || ""
    ).trim();

    const subCategory = String(
        product.subCategory || ""
    ).trim();

    return (
        category === "Hoodies & Shirts" &&
        [
            "Hoodies",
            "Oversized Hoodies",
            "Zip Hoodies",
            "Casual Shirts",
            "Formal Shirts",
            "Overshirts"
        ].includes(subCategory)
    );

});

        filteredProducts = [...allProducts];

        renderProducts(filteredProducts);

        updateProductCount();

    }catch(err){

        console.error(err);

        document.getElementById("productsContainer").innerHTML = `

            <div class="loading">

                Failed To Load Products

            </div>

        `;

    }

}
/* ==========================================
COUNT
========================================== */

function updateProductCount(){

document.getElementById("productCount").innerText=

filteredProducts.length+" Products";

}
/* ==========================================
RENDER PRODUCTS
========================================== */

function renderProducts(products){
console.log(products);
const container=document.getElementById("productsContainer");

container.innerHTML="";

if(products.length===0){

container.innerHTML=`

<div class="loading">

No Products Found

</div>

`;

return;

}

products.forEach(product=>{
    console.log(product);
console.log(product);

const oldPrice=Number(product.price);

const discount=Number(product.discount)||0;

const newPrice=Math.round(

oldPrice-(oldPrice*discount/100)

);

container.innerHTML+=`

<div class="product-card">
<div class="product-image"
onclick="openProduct('${product._id}')">

<button
type="button"
id="wishlist-${product._id}"
class="wishlist-btn"
onclick="event.stopPropagation();toggleWishlist('${product._id}')">

<i class="ri-heart-line"></i>

</button>

${product.badge ?

`<span class="product-badge ${product.badge.toLowerCase()}">
${product.badge}
</span>` : ""}

<img
src="${IMAGE_URL}uploads/${product.image}"

alt="${product.name}">

</div>

<div class="product-info">

<p class="product-brand">

${product.brand||"ZM LABEL"}

</p>

<h3 class="product-name">

${product.name}

</h3>
<div class="price-box">

<span class="new-price">
Rs.${newPrice}
</span>

${discount>0 ? `
<span class="old-price">
Rs.${oldPrice}
</span>

<span class="discount-text">
${discount}% OFF
</span>
` : ""}

</div>

<button

class="view-btn"

onclick="openProduct('${product._id}')">

View Details

</button>

</div>

</div>

`;

});

}

/* ==========================================
PRODUCT DETAILS
========================================== */

function openProduct(id){

window.location.href=

`product.html?id=${id}`;

}
/* ==========================================
SORT PRODUCTS
========================================== */

const sortSelect=document.getElementById("sortProducts");

if(sortSelect){

sortSelect.addEventListener("change",()=>{

const value=sortSelect.value;

let products=[...filteredProducts];

switch(value){

case "priceLow":

products.sort((a,b)=>{

const aPrice=(a.price-(a.price*(a.discount||0)/100));

const bPrice=(b.price-(b.price*(b.discount||0)/100));

return aPrice-bPrice;

});

break;

case "priceHigh":

products.sort((a,b)=>{

const aPrice=(a.price-(a.price*(a.discount||0)/100));

const bPrice=(b.price-(b.price*(b.discount||0)/100));

return bPrice-aPrice;

});

break;

case "nameAZ":

products.sort((a,b)=>

a.name.localeCompare(b.name)

);

break;

case "nameZA":

products.sort((a,b)=>

b.name.localeCompare(a.name)

);

break;

default:

products=[...filteredProducts];

}

renderProducts(products);

});

}
/* ==========================================
FILTER SIDEBAR
========================================== */

function setupFilterSidebar(){

const filterBtn=document.getElementById("filterBtn");

const sidebar=document.getElementById("filterSidebar");

const overlay=document.getElementById("filterOverlay");

const closeBtn=document.getElementById("closeFilter");

if(!filterBtn) return;

filterBtn.onclick=()=>{

sidebar.classList.add("active");

overlay.classList.add("active");

};

closeBtn.onclick=()=>{

sidebar.classList.remove("active");

overlay.classList.remove("active");

};

overlay.onclick=()=>{

sidebar.classList.remove("active");

overlay.classList.remove("active");

};

const apply = document.getElementById("applyFilter");

if (apply) {

    apply.onclick = () => {

        const selectedSub = document.querySelector('input[name="subCategory"]:checked');

        if (selectedSub) {

            filteredProducts = allProducts.filter(product =>
                product.subCategory === selectedSub.value
            );

        } else {

            filteredProducts = [...allProducts];

        }

        renderProducts(filteredProducts);
        updateProductCount();

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

    };

}

}

/* ==========================================
MOBILE MENU
========================================== */

function setupMobileMenu(){

const btn=document.getElementById("menuBtn");

const menu=document.getElementById("mobileMenu");

if(!btn||!menu) return;

btn.onclick=()=>{

menu.classList.toggle("active");

};

}

/* ==========================================
HELPERS
========================================== */

function calculateDiscount(price, discount){

price = Number(price);

discount = Number(discount || 0);

return Math.round(

price - (price * discount / 100)

);

}

function formatPrice(price){

return "Rs." + Number(price).toLocaleString();

}

/* ==========================================
REFRESH PRODUCTS
========================================== */

function refreshProducts(){

renderProducts(filteredProducts);

updateProductCount();

}

/* ==========================================
WINDOW EVENTS
========================================== */

window.addEventListener("resize",()=>{

const menu=document.getElementById("mobileMenu");

if(window.innerWidth>992 && menu){

menu.classList.remove("active");

}

});


/* ==========================================
WISHLIST
========================================== */

async function toggleWishlist(productId){

    

    try{

        const token = localStorage.getItem("token");

        if(!token){

            window.location.href="login.html";

            return;

        }

        const response = await fetch(

            "http://localhost:5000/api/wishlist",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:`Bearer ${token}`

                },

                body:JSON.stringify({

                    productId

                })

            }

        );

        const data = await response.json();

        console.log("Wishlist Response:",data);

        if(data.success){

            const btn=document.getElementById(

                `wishlist-${productId}`

            );

         if(btn){

    const icon = btn.querySelector("i");

    if(data.action==="added"){

        btn.classList.add("active");

        if(icon){

            icon.className="ri-heart-fill";

        }

        showToast("❤️ Product added to Wishlist");

    }

    if(data.action==="removed"){

        btn.classList.remove("active");

        if(icon){

            icon.className="ri-heart-line";

        }

        showToast("💔 Product removed from Wishlist");

    }

}

            loadWishlistCount();

        }

        else{

            alert(data.message);

        }

    }

    catch(err){

        console.log(err);

    }

}
/* ==========================================
TOAST
========================================== */

function showToast(message){

    const toast=document.getElementById("toast");

    if(!toast) return;

    toast.innerText=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2000);

}

/* ==========================================
LOAD WISHLIST COUNT
========================================== */

async function loadWishlistCount(){

    try{

        const badge=document.getElementById("wishlistCount");

        if(!badge) return;

        const token=localStorage.getItem("token");

        if(!token){

            badge.innerText="0";

            return;

        }

        const response=await fetch(

            "http://localhost:5000/api/wishlist",

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );

        const data=await response.json();

        console.log("Wishlist Count Response:",data);

       if(data.success){

    badge.innerText = data.products.length;

}else{

    badge.innerText = "0";

}

    }

    catch(err){

        console.log(err);

    }

}

console.log("✅ Hoodies Page Loaded Successfully");