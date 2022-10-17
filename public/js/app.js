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
    updated() {
        this.checkScrollPosition();
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
                    this.images.unshift(data.entry);
                    this.message = data.message;
                })
                .catch((err) => console.log(err));
            this.currentImage = {};
        },
        loadImages() {
            fetch("/images")
                .then((res) => res.json())
                .then((data) => {
                    this.images.push(...data);
                })
                .catch((err) => console.log(err));
        },
        checkScrollPosition() {
            if (this.images.length > 0) {
                const lastEntry = this.images[this.images.length - 1];
                const lastId = lastEntry.id.toString();
                const lastNode = document.getElementById(lastId);
                setTimeout(() => {
                    document.addEventListener(
                        "scroll",
                        (e) => {
                            if (
                                1.5 * screen.height + window.scrollY >=
                                lastNode.offsetTop
                            ) {
                                this.loadMoreImages(lastEntry.id);
                            } else {
                                this.checkScrollPosition();
                            }
                        },
                        {
                            once: true,
                        }
                    );
                }, 200);
            }
        },
        loadMoreImages(id) {
            fetch(`/more/${id}`)
                .then((response) => response.json())
                .then((entries) => {
                    this.images.push(...entries);
                    const noMoreImages = this.images.some(
                        (entry) => entry.id === entry.lowest_id
                    );
                    !noMoreImages && this.checkScrollPosition();
                });
        },
        showDialogue(e) {
            this.imageDialogueId = e.currentTarget.id;
        },
        closeDialogue(e) {
            this.imageDialogueId = null;
        },
        showForm(e) {
            const form = document.getElementById("upload-form");
            const uploadText = document.getElementById("upload-prompt");
            uploadText.style.visibility = "hidden";
            setTimeout(() => (form.style.visibility = "visible"), 400);
        },
        hideForm(e) {
            const form = document.getElementById("upload-form");
            const uploadText = document.getElementById("upload-prompt");
            uploadText.style.visibility = "visible";
            form.style.visibility = "hidden";
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
