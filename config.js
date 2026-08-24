/* ==========================================
   ZM LABEL
   GLOBAL CONFIG
   ========================================== */

(() => {

    "use strict";


    /*
       FRONTEND
       ----------
       Local:
       http://127.0.0.1:5500

       BACKEND:
       http://localhost:5000
    */

    const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";


    const API_BASE_URL =
        window.ZM_API_BASE ||
        (
            isLocal
                ? "http://localhost:5000/api"
                : "/api"
        );


    const SERVER_BASE_URL =
        window.ZM_SERVER_URL ||
        (
            isLocal
                ? "http://localhost:5000"
                : ""
        );


    /* ==========================================
       API ENDPOINTS
       ========================================== */

    window.ZM_API_BASE_URL =
        API_BASE_URL;

    window.ZM_SERVER_URL =
        SERVER_BASE_URL;


    window.AUTH_API =
        `${API_BASE_URL}/auth`;

    window.PRODUCTS_API =
        `${API_BASE_URL}/products`;

    window.ORDERS_API =
        `${API_BASE_URL}/orders`;


    /* ==========================================
       IMAGE BASE
       ========================================== */

    window.IMAGE_BASE_URL =
        `${SERVER_BASE_URL}/uploads/`;


    /* ==========================================
       HELPERS
       ========================================== */

    window.ZM_API_URL = function (path = "") {

        const base =
            String(API_BASE_URL)
                .replace(/\/+$/, "");

        const cleanPath =
            String(path)
                .replace(/^\/+/, "");

        return cleanPath
            ? `${base}/${cleanPath}`
            : base;

    };


    window.ZM_IMAGE_URL = function (image = "") {

        if (!image) {
            return "";
        }


        let value =
            String(image).trim();


        if (!value) {
            return "";
        }


        /* Full URL */

        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("data:")
        ) {

            return value;

        }


        /* Protocol-relative URL */

        if (
            value.startsWith("//")
        ) {

            return (
                window.location.protocol +
                value
            );

        }


        value =
            value.replace(/^\/+/, "");


        const server =
            String(
                SERVER_BASE_URL
            ).replace(/\/+$/, "");


        /*
           Backend already returns:
           uploads/filename.jpg
        */

        if (
            value.startsWith("uploads/")
        ) {

            return server
                ? `${server}/${value}`
                : `/${value}`;

        }


        /*
           Sometimes backend returns:
           /uploads/filename.jpg
        */

        if (
            value.startsWith("upload/")
        ) {

            return server
                ? `${server}/${value}`
                : `/${value}`;

        }


        /*
           If only filename is returned:
           filename.jpg
        */

        return server
            ? `${server}/uploads/${value}`
            : `/uploads/${value}`;

    };


    console.log(
        "ZM CONFIG READY",
        {
            API_BASE_URL,
            SERVER_BASE_URL,
            PRODUCTS_API:
                window.PRODUCTS_API
        }
    );

})();