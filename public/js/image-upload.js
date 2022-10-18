const imageUpload = {
    data() {
        return {
            currentImage: {},
        };
    },
    props: [],
    mounted() {},
    methods: {
        setFile(e) {
            this.currentImage.file = e.target.files[0];
            this.showForm();
        },
        upload(e) {
            if (Object.keys(this.currentImage).length < 5) {
                this.$emit("failed", { error: "Please fill out all fields." });
                return;
            }
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
                    this.returnLastEntry(data);
                })
                .catch((err) => console.log(err));
            this.currentImage = {};
        },
        returnLastEntry(returnObj) {
            this.$emit("uploaded", returnObj);
        },
        checkInputValue() {
            if (
                !Object.keys(this.currentImage).some(
                    (key) => this.currentImage[key]
                )
            ) {
                this.$emit("hideuploader");
            } else {
                const form = document.getElementById("upload-form");
                form.style.visibility = "hidden";
            }
        },
        showForm() {
            const form = document.getElementById("upload-form");
            form.style.visibility = "visible";
        },
    },
    template: `
                <form id="upload-form" action="/images" method="post" enctype="multipart/form-data"  @submit.prevent="upload" @mouseleave="checkInputValue" @mouseenter="showForm">
                    <label for="title">Title</label>
                    <input v-model="currentImage.title" type="text" name="title" id="">
                    <label for="description">Description</label>
                    <input v-model="currentImage.description" type="text" name="description" id="">
                    <label for="tagstring">Tags</label>
                    <input v-model="currentImage.tagstring" type="text" name="tagstring" id="">
                    <label for="username">Username</label>
                    <input v-model="currentImage.username" type="text" name="username" id="">
                    <label for="file">File</label>
                    <input @change="setFile" type="file" name="file" id="image-file" accept="image/*">
                    <input type="submit" value="Upload">
                </form>
            `,
};

export default imageUpload;
