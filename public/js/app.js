import * as Vue from "./vue.js";
import imageDialogue from "./image-dialogue.js";

const app = Vue.createApp({
    data() {
        return {
            message: "",
            items: [],
            images: [],
            currentImage: {
                username: "",
                title: "",
                description: "",
                tagstring: "",
                file: "",
                id: "",
                created_at: "",
            },
        };
    },
    props: [],
    mounted() {
        this.loadImages();
        // this.getDummyData(12, this.setSelf);
        // setTimeout(
        //     window.addEventListener("scroll", this.loadMoreResults),
        //     500
        // );
    },
    // components: {
    //     "image-dialogue": imageDialogue,
    // },
    methods: {
        setFile(e) {
            this.currentImage.file = e.target.files[0];
            console.log(this.currentImage.file);
        },
        upload(e) {
            const formData = new FormData();
            formData.append("username", this.currentImage.username);
            formData.append("title", this.currentImage.title);
            formData.append("description", this.currentImage.description);
            formData.append("tagstring", this.currentImage.tagstring);
            formData.append("file", this.currentImage.file);

            fetch("/image", {
                method: "POST",
                body: formData,
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        Object.assign(this.currentImage, data.currentImage);
                        this.images.shift(data.currentImage);
                        this.message = data.message;
                    }
                });
        },
        loadImages() {
            fetch("/images")
                .then((res) => res.json())
                .then((data) => this.images.push(...data))
                .catch((err) => console.log(err));
        },
        refresh(timestamp) {
            // console.log("target ", e.target);
            // console.log(e.target.scrollTop);
        },
        showDialogue(e) {},
        setSelf(elem) {
            this.items = elem;
        },
        getDummyData(num, callback) {
            const dataArray = [];
            Promise.all([
                fetchImages(num),
                fetchHipsterIpsum(num),
                fetchHipsterIpsum(num),
            ]).then(function (data) {
                const images = data[0].map((item) => item.url);
                const descriptions = data[1].map((sentence) => {
                    return sentence[0].split(" ").slice(0, 3).join(" ");
                });
                const tags = data[2].map((sentence) => {
                    sentence = sentence[0].split(" ").slice(0, 4);
                    return sentence;
                });
                for (let i = 0; i < num; i++) {
                    let item = {
                        url: images[i],
                        description: descriptions[i],
                        tags: tags[i],
                    };
                    dataArray.push(item);
                }
                callback(dataArray);
            });
        },
    },
}).mount("#main");

function fetchImages(num) {
    const images = [];
    for (let i = 0; i < num; i++) {
        images.push(fetch("https://picsum.photos/300"));
    }
    return Promise.all(images);
}

function fetchHipsterIpsum(num) {
    const descriptions = [];
    for (let i = 0; i < num; i++) {
        descriptions.push(
            fetch(
                "http://hipsum.co/api/?" +
                    new URLSearchParams({
                        type: "hipster-centric",
                        sentences: 1,
                    })
            ).then((response) => response.json())
        );
    }
    return Promise.all(descriptions);
}

//data defines a function that returns an object in which we can assign the variable that will be used in the app
