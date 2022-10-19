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
        this.checkLocation();
        this.loadImages();
    },
    updated() {
        this.checkLocation();
        this.checkScrollPosition();
        window.addEventListener("popstate", (e) => {
            this.checkLocation();
        });
    },
    methods: {
        loadImages() {
            this.autoload = true;
            this.images = [];
            fetch("/images")
                .then((res) => res.json())
                .then((data) => {
                    this.images.push(...data);
                })
                .catch((err) => console.log(err));
        },
        checkScrollPosition() {
            if (this.images.length > 0 && this.autoload) {
                const lastEntry = this.images[this.images.length - 1];
                const lastId = lastEntry.id.toString();
                const lastNode = document.getElementById(lastId);
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
                                setTimeout(this.checkScrollPosition, 300);
                            }
                        } else {
                            setTimeout(this.checkScrollPosition, 300);
                        }
                    },
                    {
                        once: true,
                    }
                );
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
        searchTags(e) {
            if (e.currentTarget.id !== "filter-button") {
                this.tagsearch = e.currentTarget.innerText;
            }
            if (!this.tagsearch) {
                this.loadImages;
                return;
            }
            fetch(`/tag/${this.tagsearch}`)
                .then((response) => response.json())
                .then((entries) => {
                    if (entries.length === 0) {
                        window.alert(`No image found with this tag!`);
                    } else {
                        this.images = [];
                        this.images.push(...entries);
                    }
                })
                .catch((err) => console.log(err));
            this.autoload = false;
            this.tagsearch = "";
        },
        showDialogue(e) {
            this.imageDialogueId = e.currentTarget.id;
            history.pushState({}, "", `/modal/${this.imageDialogueId}`);
        },
        closeDialogue() {
            this.imageDialogueId = null;
            history.pushState({}, "", "/");
        },
        showUploader() {
            const message = document.getElementById("upload-prompt");
            message.style.visibility = "hidden";
            if (this.uploader === true) {
                if (document.getElementById("upload-form")) {
                    const form = document.getElementById("upload-form");
                    if (form.style.visibility === "hidden") {
                        form.style.visibility = "visible";
                    }
                } else {
                    this.showUploader;
                }
            } else {
                this.uploader = true;
            }
        },
        hideUploader() {
            this.uploader = false;
        },
        showErrorMessage(errObj) {
            window.alert(errObj.error);
        },
        showLastEntry(returnObj) {
            this.images.unshift(returnObj.entry);
            this.message = returnObj.message;
            this.hideUploader();
        },
        checkLocation() {
            const clientLocation = location.pathname.split("/");
            const requestedId = clientLocation[2];
            if (
                clientLocation[1] === "modal" &&
                !isNaN(parseInt(requestedId))
            ) {
                fetch(`/validate/${requestedId}`)
                    .then((response) => response.json())
                    .then((count) => {
                        if (count == 0) {
                            history.replaceState({}, "", "/");
                            this.imageDialogueId = null;
                        } else {
                            this.imageDialogueId = requestedId;
                        }
                    });
            } else {
                history.replaceState({}, "", "/");
                this.imageDialogueId = null;
            }
        },
    },
}).mount("#main");

//data defines a function that returns an object in which we can assign the variable that will be used in the app
