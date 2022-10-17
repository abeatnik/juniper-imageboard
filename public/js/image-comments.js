const imageComments = {
    data() {
        return {
            comments: [],
            currentComment: {
                comment: "",
                username: "",
                imageId: this.imageId,
            },
        };
    },
    props: ["imageId"],
    mounted() {
        this.getComments();
    },
    methods: {
        uploadComment(e) {
            const body = { ...this.currentComment };
            fetch("/comments", {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(body),
            })
                .then((response) => response.json())
                .then((entry) => {
                    this.comments.unshift(entry);
                })
                .catch((err) => console.log(err));
            this.currentComment.comment = "";
            this.currentComment.username = "";
        },
        getComments() {
            fetch(`/comments/${this.imageId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.comments.push(...data);
                })
                .catch((err) => console.log(err));
        },
    },
    template: `
        <div class="comments-container">
            <h2>Comments</h2>
            <form action="/comments" method="post" @submit.prevent="uploadComment">
                <textarea v-model="currentComment.comment" name="comment" id="comment" cols="30" rows="3">new comment</textarea>
                <label for="username">username</label>
                <input v-model="currentComment.username" type="text" name="username" id="username">
                <button type="submit">Submit</button>
            </form>
            <div class="comment-box" v-for="entry in comments">
                <h4>{{entry.comment}}</h4>
                <p>Created by {{entry.username}} at {{entry.created_at}}</p>
            </div>
        </div>
    `,
};

export default imageComments;
