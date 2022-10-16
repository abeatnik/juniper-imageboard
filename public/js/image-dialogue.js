const imageDialogue = {
    data() {
        return {
            imageObj: {},
        };
    },
    props: ["id"],
    mounted() {
        if (this.id) {
            this.getImageInfo(this.id);
            const bg = document.getElementById("modal-background");
            const md = document.getElementsByClassName("modal-dialogue")[0];
            const origin = document.getElementById(this.id);
            bg.style.height = document.body.offsetHeight + "px";
            md.style.left = origin.offsetLeft - 10 + "px";
            md.style.top = origin.offsetTop - 10 + "px";
            this.growModal();
        }
    },
    methods: {
        getImageInfo(id) {
            fetch(`/image/${id}`)
                .then((response) => response.json())
                .then((imageObj) => {
                    console.log(imageObj);
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
            const md = document.getElementsByClassName("modal-dialogue")[0];
            setTimeout(() => {
                md.classList.add("modal-grow");
                md.style.left = "28vw";
                md.style.top = window.scrollY + 10 + "px";
            }, 300);
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
            <div class="title-container"  v-if="imageObj.title">
                <p class="title">{{imageObj.title}}</p>
                <p class="user-info">uploaded by <span>{{imageObj.username}}</span> Date: <span>{{imageObj.created_at}}</span></p>
            </div>
            <div class="description-container" v-if="imageObj.description">
                <p :class="modal-description">{{imageObj.description}}</p>
            </div>
            <div class="tag-container" v-if="imageObj.tagstring" >
                <div class="tag-box">{{imageObj.tagstring}}</div>
            </div>
        </div>
    </div>
        
    `,
};

export default imageDialogue;
