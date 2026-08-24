/* ==========================================
ZM LABEL
WISHLIST
========================================== */

const WISHLIST_API = "http://localhost:5000/api/wishlist";


document.addEventListener("DOMContentLoaded",()=>{

    loadWishlist();

});

/* ==========================================
LOAD WISHLIST
========================================== */

async function loadWishlist(){

    try{

        const response = await fetch(

            WISHLIST_API,

            {

                headers:{

                    Authorization:

                    `Bearer ${localStorage.getItem("token")}`

                }

            }

        );

        const data = await response.json();

        console.log(data);

        updateWishlistCount(

            data.products.length

        );

        renderWishlist(

            data.products

        );

    }

    catch(error){

        console.log(error);

    }

}
/* ==========================================
RENDER WISHLIST
========================================== */

function renderWishlist(products){

    const container = document.getElementById(

        "wishlist-items"

    );

    const empty = document.getElementById(

        "emptyWishlist"

    );

    container.innerHTML = "";

    if(products.length===0){

        container.style.display="none";

        empty.style.display="block";

        return;

    }

    container.style.display="grid";

    empty.style.display="none";

    products.forEach(product=>{

        container.innerHTML += `

<div class="wishlist-card">

<div class="wishlist-image">

<img

src="${IMAGE_URL}uploads/${product.image}"

alt="${product.name}">

</div>

<div class="wishlist-info">

<p class="brand">

${product.brand}

</p>

<h3>

${product.name}

</h3>

<h4>

Rs.${product.price}

</h4>

<div class="wishlist-actions">

<button

class="view-btn"

onclick="window.location.href='product.html?id=${product._id}'">

View Details

</button>

<button

class="remove-btn"

onclick="removeWishlist('${product._id}')">

<i class="ri-delete-bin-6-line"></i>

Remove

</button>

</div>

</div>

</div>

`;

    });

}
/* ==========================================
REMOVE FROM WISHLIST
========================================== */

async function removeWishlist(productId){

    try{

        const response = await fetch(

            WISHLIST_API,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:

                    `Bearer ${localStorage.getItem("token")}`

                },

                body:JSON.stringify({

                    productId

                })

            }

        );

        const data = await response.json();

        if(data.success){

            showToast("💔 Product removed from Wishlist");

            updateWishlistCount(

                data.products.length

            );

            renderWishlist(

                data.products

            );

        }

    }

    catch(error){

        console.log(error);

    }

}

/* ==========================================
WISHLIST COUNT
========================================== */

function updateWishlistCount(count){

    const badge = document.getElementById(

        "wishlistCount"

    );

    if(badge){

        badge.innerText = count;

    }

}
/* ==========================================
TOAST
========================================== */

function showToast(message){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2000);

}

/* ==========================================
LOGIN CHECK
========================================== */

if(!localStorage.getItem("token")){

    updateWishlistCount(0);

}