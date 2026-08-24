/* =========================================================
   ZM LABEL AI ASSISTANT
========================================================= */

const ZM_AI_API =
    "http://localhost:5000/api/ai/chat";


let zmAiHistory = [];



/* =========================================================
   ELEMENTS
========================================================= */

const zmAiButton =
    document.getElementById("zmAiButton");

const zmAiChat =
    document.getElementById("zmAiChat");

const zmAiClose =
    document.getElementById("zmAiClose");

const zmAiForm =
    document.getElementById("zmAiForm");

const zmAiInput =
    document.getElementById("zmAiInput");

const zmAiMessages =
    document.getElementById("zmAiMessages");

const zmAiTyping =
    document.getElementById("zmAiTyping");



/* =========================================================
   OPEN
========================================================= */

function openZMAI() {

    if (!zmAiChat) return;

    zmAiChat.classList.add("active");

    zmAiChat.setAttribute(
        "aria-hidden",
        "false"
    );

    setTimeout(() => {

        if (zmAiInput) {
            zmAiInput.focus();
        }

    }, 250);

}



/* =========================================================
   CLOSE
========================================================= */

function closeZMAI() {

    if (!zmAiChat) return;

    zmAiChat.classList.remove("active");

    zmAiChat.setAttribute(
        "aria-hidden",
        "true"
    );

}



/* =========================================================
   BUTTONS
========================================================= */

if (zmAiButton) {

    zmAiButton.addEventListener(
        "click",
        openZMAI
    );

}


if (zmAiClose) {

    zmAiClose.addEventListener(
        "click",
        closeZMAI
    );

}



/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeZMAI();

        }

    }
);



/* =========================================================
   ADD MESSAGE
========================================================= */

function addZMAIMessage(
    message,
    role
) {

    if (!zmAiMessages) return;


    const wrapper =
        document.createElement("div");

    wrapper.className =
        `zm-ai-message ${role}`;


    const bubble =
        document.createElement("div");

    bubble.className =
        "zm-ai-bubble";


    /*
       Convert simple line breaks
       without using innerHTML
    */

    bubble.textContent =
        message;


    wrapper.appendChild(bubble);

    zmAiMessages.appendChild(wrapper);


    zmAiMessages.scrollTop =
        zmAiMessages.scrollHeight;

}



/* =========================================================
   TYPING
========================================================= */

function setZMAITyping(show) {

    if (!zmAiTyping) return;

    zmAiTyping.classList.toggle(
        "active",
        show
    );

}



/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendZMAIMessage(message) {

    const cleanMessage =
        String(message || "").trim();


    if (!cleanMessage) return;


    addZMAIMessage(
        cleanMessage,
        "user"
    );


    zmAiHistory.push({

        role: "user",

        content: cleanMessage

    });


    if (zmAiHistory.length > 10) {

        zmAiHistory =
            zmAiHistory.slice(-10);

    }


    setZMAITyping(true);


    try {

        const response =
            await fetch(
                ZM_AI_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            cleanMessage,

                        history:
                            zmAiHistory

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "AI request failed"
            );

        }


        const reply =
            data.reply ||
            "Sorry, I couldn't answer that right now.";


        addZMAIMessage(
            reply,
            "ai"
        );


        zmAiHistory.push({

            role: "assistant",

            content: reply

        });


        if (zmAiHistory.length > 10) {

            zmAiHistory =
                zmAiHistory.slice(-10);

        }


    }

    catch (error) {

        console.error(
            "ZM AI Frontend Error:",
            error
        );


        addZMAIMessage(
            "Sorry, I'm having a little trouble right now. Please try again in a moment.",
            "ai"
        );

    }

    finally {

        setZMAITyping(false);

    }

}



/* =========================================================
   FORM
========================================================= */

if (zmAiForm) {

    zmAiForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const message =
                zmAiInput.value.trim();


            if (!message) return;


            zmAiInput.value = "";


            sendZMAIMessage(
                message
            );

        }
    );

}



/* =========================================================
   QUICK QUESTIONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-question]"
            );


        if (!button) return;


        const question =
            button.dataset.question;


        openZMAI();


        sendZMAIMessage(
            question
        );

    }
);