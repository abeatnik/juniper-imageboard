import * as Vue from "./vue.js";
import imageDialogue from "./image-dialogue.js";
import imageUpload from "./image-upload.js";

Vue.createApp({
    data() {
        return {
            message: "Upload \n your \n image",
            images: [],
            currentImage: {
                username: "",
                title: "",
                description: "",
                tagstring: "",
                file: "",
            },
            imageDialogueId: null,
            uploader: false,
        };
    },
    components: {
        "image-dialogue": imageDialogue,
        "image-upload": imageUpload,
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
                            if (lastNode) {
                                if (
                                    1.5 * screen.height + window.scrollY >=
                                    lastNode.offsetTop
                                ) {
                                    this.loadMoreImages(lastEntry.id);
                                } else {
                                    this.checkScrollPosition();
                                }
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
        showUploader() {
            const message = document.getElementById("upload-prompt");
            message.style.visibility = "hidden";
            if (this.uploader === true) {
                const form = document.getElementById("upload-form");
                if (form.style.visibility === "hidden") {
                    form.style.visibility = "visible";
                }
            } else {
                this.uploader = true;
            }
        },
        hideUploader() {
            this.uploader = false;
        },
        showLastEntry(returnObj) {
            this.images.unshift(returnObj.entry);
            this.message = returnObj.message;
            this.hideUploader();
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
