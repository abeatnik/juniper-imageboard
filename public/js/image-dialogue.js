import imageComments from "./image-comments.js";

const imageDialogue = {
    data() {
        return {
            imageObj: {},
            neighbors: [],
            previous: false,
            next: false,
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
            this.fetchNeighbors(this.id);
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
                const prev =
                    document.getElementsByClassName("previous-modal")[0];
                const next = document.getElementsByClassName("next-modal")[0];
                md.classList.add("modal-grow");
                md.style.left = "28vw";
                md.style.top = window.scrollY + 10 + "px";
                prev.style.top = md.offsetTop + 200 + "px";
                next.style.top = md.offsetTop + 200 + "px";
            }, 200);
        },
        fetchNeighbors() {
            fetch(`/neighbors/${this.id}`)
                .then((response) => response.json())
                .then((entries) => {
                    console.log(entries);
                    this.neighbors.push(...entries);
                    this.previous = Object.keys(this.neighbors[0]).length > 0;
                    this.next = Object.keys(this.neighbors[1]).length > 0;
                });
        },
        openPrevious() {
            const obj = { ...this.neighbors[0] };
            console.log("change to: ", obj);
            // history.pushState(
            //     { show: obj },
            //     "",
            //     `/modal/${this.neighbors[0].id}`
            // );
            // this.$emit("close");
        },
        openNext() {
            const obj = { ...this.neighbors[1] };
            console.log("change to: ", obj);
            // history.pushState(
            //     this.neighbors[1],
            //     "",
            //     `/modal/${this.neighbors[1].id}`
            // );
            // this.$emit("close");
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
        <div class="previous-modal" v-if="previous" @click="openPrevious"><div></div></div>
        <div class="next-modal" v-if="next" @click="openNext"><div></div></div>
    </div>
    `,
};

export default imageDialogue;
