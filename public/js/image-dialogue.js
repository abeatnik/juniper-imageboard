import imageComments from "./image-comments.js";

const imageDialogue = {
    data() {
        return {
            imageObj: {},
        };
    },
    props: ["id"],
    components: {
        "image-comments": imageComments,
    },
    mounted() {
        if (this.id) {
            this.getImageInfo(this.id);
            const bg = document.getElementById("modal-background");
            const md = document.getElementsByClassName("modal-dialogue")[0];
            bg.style.minHeight = document.body.offsetHeight * 1.4 + "px";

            if (document.getElementById(this.id)) {
                const origin = document.getElementById(this.id);
                md.style.left = origin.offsetLeft - 10 + "px";
                md.style.top = origin.offsetTop - 10 + "px";
            } else {
                md.style.left = "28vw";
                md.style.top = window.scrollY + 10 + "px";
            }
            this.growModal();
        }
    },
    methods: {
        getImageInfo(id) {
            fetch(`/image/${id}`)
                .then((response) => response.json())
                .then((imageObj) => {
                    this.imageObj = imageObj;
                });
        },
        returnToMain(e) {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
                this.$emit("close");
            }
        },
        growModal() {
            const bg = document.getElementById("modal-background");
            const md = document.getElementsByClassName("modal-dialogue")[0];
            setTimeout(() => {
                md.classList.add("modal-grow");
                md.style.left = "28vw";
                md.style.top = window.scrollY + 10 + "px";
            }, 200);
        },
    },
    template: `
    <div id="modal-background" @click="returnToMain">
        <div class="item-container modal-dialogue" >
            <div class="pic-container">
                <div class="pic-border">
                    <img :src="imageObj.url" />
                </div>
            </div>
            <div class="title-container" >
                <p class="title">{{imageObj.title}}</p>
                <p class="user-info">uploaded by {{imageObj.username}} on {{new Date(imageObj.created_at).toLocaleDateString()}} at {{new Date(imageObj.created_at).toLocaleTimeString()}}</p>
            </div>
            <div class="description-container">
                <p :class="modal-description">{{imageObj.description}}</p>
            </div>
            <div class="tag-container" v-if="imageObj.tags" >
                <div class="tag-box" v-for="tag in imageObj.tags">{{tag}}</div>
            </div>
            <image-comments v-bind:image-id="id"></image-comments>
        </div>
    </div>
    `,
};

export default imageDialogue;
