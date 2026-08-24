// ==========================================================
// ZM LABEL — AUTH.JS
// SIGNUP + LOGIN + USER SESSION
// ==========================================================

"use strict";


// ==========================================================
// API BASE
// ==========================================================

const AUTH_BASE =
    window.AUTH_API ||
    (
        window.ZM_API_BASE_URL
            ? `${window.ZM_API_BASE_URL}/auth`
            : "/api/auth"
    );


// ==========================================================
// SIGNUP
// ==========================================================

const signupBtn =
    document.getElementById("signupBtn");


if (signupBtn) {

    signupBtn.addEventListener(
        "click",
        async function () {

            const name =
                document
                    .getElementById("signupName")
                    ?.value
                    .trim();


            const email =
                document
                    .getElementById("signupEmail")
                    ?.value
                    .trim();


            const phone =
                document
                    .getElementById("signupPhone")
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById("signupPassword")
                    ?.value
                    .trim();


            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                !name ||
                !email ||
                !phone ||
                !password
            ) {

                alert(
                    "Please fill all fields."
                );

                return;

            }


            if (password.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;

            }


            // ==================================================
            // BUTTON
            // ==================================================

            const originalText =
                signupBtn.innerText;


            signupBtn.disabled = true;

            signupBtn.innerText =
                "Creating Account...";


            try {

                // ==================================================
                // REGISTER
                // ==================================================

                const res =
                    await fetch(
                        `${AUTH_BASE}/register`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name,
                                    email,
                                    phone,
                                    password

                                })

                        }
                    );


                const data =
                    await res.json();


                // ==================================================
                // ERROR
                // ==================================================

                if (!res.ok || !data.success) {

                    alert(
                        data.message ||
                        "Unable to create account."
                    );

                    return;

                }


                // ==================================================
                // SUCCESS
                // ==================================================

                alert(
                    "Account Created Successfully!"
                );


                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.error(
                    "SIGNUP ERROR:",
                    error
                );


                alert(
                    "Server Error. Please try again."
                );

            }

            finally {

                signupBtn.disabled =
                    false;

                signupBtn.innerText =
                    originalText;

            }

        }
    );

}


// ==========================================================
// LOGIN
// ==========================================================
// ==============================
// LOGIN API
// EMAIL + WHATSAPP + PASSWORD
// ==============================

const loginBtn =
    document.getElementById("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        async () => {

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const phone =
                document
                    .getElementById("loginPhone")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value
                    .trim();


            // ==============================
            // VALIDATION
            // ==============================

            if (
                !email ||
                !phone ||
                !password
            ) {

                alert(
                    "Please enter your email, WhatsApp number and password."
                );

                return;
            }


            try {

                const res =
                    await fetch(
                        `${window.AUTH_API}/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    email,
                                    phone,
                                    password

                                })
                        }
                    );


                const data =
                    await res.json();


                if (!data.success) {

                    alert(
                        data.message ||
                        "Login failed."
                    );

                    return;
                }


                // ==============================
                // SAVE LOGIN
                // ==============================

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(data.user)
                );


                alert(
                    "Login Successful"
                );


                // ==============================
                // REDIRECT
                // ==============================

                if (
                    data.user.role === "admin"
                ) {

                    window.location.href =
                        "admin.html";

                }

                else {

                    window.location.href =
                        "index.html";

                }

            }

            catch (err) {

                console.error(
                    "LOGIN ERROR:",
                    err
                );

                alert(
                    "Server Error"
                );

            }

        }
    );

}

// ==========================================================
// LOGIN PASSWORD EYE
// ==========================================================

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            const password =
                document.getElementById(
                    "loginPassword"
                );


            if (!password) {
                return;
            }


            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";

                togglePassword.className =
                    "ri-eye-off-line";

            }

            else {

                password.type =
                    "password";

                togglePassword.className =
                    "ri-eye-line";

            }

        }
    );

}


// ==========================================================
// SIGNUP PASSWORD EYE
// ==========================================================

const toggleSignupPassword =
    document.getElementById(
        "toggleSignupPassword"
    );


if (toggleSignupPassword) {

    toggleSignupPassword.addEventListener(
        "click",
        function () {

            const password =
                document.getElementById(
                    "signupPassword"
                );


            if (!password) {
                return;
            }


            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";

                toggleSignupPassword.className =
                    "ri-eye-off-line";

            }

            else {

                password.type =
                    "password";

                toggleSignupPassword.className =
                    "ri-eye-line";

            }

        }
    );

}


// ==========================================================
// CURRENT USER
// ==========================================================

const userName =
    document.getElementById(
        "userName"
    );


const loginLink =
    document.getElementById(
        "loginLink"
    );


if (userName) {

    try {

        const currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        if (currentUser) {

            userName.innerText =
                currentUser.name ||
                "Account";


            if (loginLink) {

                loginLink.style.display =
                    "none";

            }

        }

        else {

            userName.innerText =
                "Login";

        }

    }

    catch (error) {

        console.error(
            "CURRENT USER ERROR:",
            error
        );

        userName.innerText =
            "Login";

    }

}


// ==========================================================
// USER MENU
// ==========================================================

const userMenu =
    document.getElementById(
        "userMenu"
    );


if (userMenu) {

    userMenu.addEventListener(
        "click",
        function (e) {

            e.stopPropagation();

            this.classList.toggle(
                "active"
            );

        }
    );

}


document.addEventListener(
    "click",
    function () {

        if (userMenu) {

            userMenu.classList.remove(
                "active"
            );

        }

    }
);


// ==========================================================
// LOGOUT
// ==========================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (e) {

            e.preventDefault();


            localStorage.removeItem(
                "currentUser"
            );


            localStorage.removeItem(
                "token"
            );


            alert(
                "Logged Out Successfully"
            );


            window.location.href =
                "login.html";

        }
    );

}