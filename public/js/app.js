import * as Vue from "./vue.js";
import imageDialogue from "./image-dialogue.js";

Vue.createApp({
    data() {
        return {
            message: "",
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
            imageDialogueId: null,
        };
    },
    components: {
        "image-dialogue": imageDialogue,
    },
    props: [],
    mounted() {
        this.loadImages();
        // this.insertDummyData(1);
    },
    methods: {
        setFile(e) {
            this.currentImage.file = e.target.files[0];
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
                })
                .catch((err) => console.log(err));
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
        showDialogue(e) {
            this.imageDialogueId = e.currentTarget.id;
        },
        closeDialogue(e) {
            this.imageDialogueId = null;
        },
        setSelf(elem) {
            this.items = elem;
        },
        insertDummyData(num) {
            for (let i = 0; i < num; i++) {
                const tagstring = tags[i].join(" ");
                fetch("/dummy");
            }
        },
    },
}).mount("#main");

//data defines a function that returns an object in which we can assign the variable that will be used in the app
