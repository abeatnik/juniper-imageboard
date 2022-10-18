import * as Vue from "./vue.js";
import imageDialogue from "./image-dialogue.js";
import imageUpload from "./image-upload.js";
import animation from "./animation.js";

Vue.createApp({
    data() {
        return {
            message: "Upload \n your \n image",
            images: [],
            currentImage: {
                username: "",
                title: "",
                description: "",
                tags: "",
                file: "",
                tagstring: "",
            },
            imageDialogueId: null,
            uploader: false,
            tagsearch: "",
            autoload: true,
            animate: false,
        };
    },
    components: {
        "image-dialogue": imageDialogue,
        "image-upload": imageUpload,
        animation: animation,
    },
    props: [],
    mounted() {
        this.autoload = true;
        this.loadImages();
    },
    updated() {
        this.checkScrollPosition();
    },
    methods: {
        loadImages() {
            this.autoload = true;

            this.images = [];
            fetch("/images")
                .then((res) => res.json())
                .then((data) => {
                    this.images.push(...data);
                    console.log(this.images);
                })
                .catch((err) => console.log(err));
        },
        checkScrollPosition() {
            if (this.images.length > 0 && this.autoload) {
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
        searchTags() {
            fetch(`/tag/${this.tagsearch}`)
                .then((response) => response.json())
                .then((entries) => {
                    this.images = [];
                    this.images.push(...entries);
                })
                .catch((err) => console.log(err));
            this.autoload = false;
            this.tagsearch = "";
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
    },
}).mount("#main");

//data defines a function that returns an object in which we can assign the variable that will be used in the app
