import * as Vue from "./vue.js";

Vue.createApp({
    data() {
        return {
            images: "",
        };
    },
    mounted() {
        function fetchImages() {
            const images = [];
            for (let i = 0; i <= 12; i++) {
                images.push(fetch("https://picsum.photos/300"));
            }
            return Promise.all(images);
        }
        fetchImages().then((data) => {
            this.images = data.map((data) => data.url);
        });
    },
}).mount("#main");

//data defines a function that returns an object in which we can assign the variable that will be used in the app
