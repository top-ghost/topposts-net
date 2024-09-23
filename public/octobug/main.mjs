import { createAppAuth } from "https://esm.sh/@octokit/auth-app";
import { Octokit } from "https://esm.sh/@octokit/core";

window.octokit = null;
window.currentPost = {};

function authorize() {
  const privateKey = localStorage.getItem("githubPrivateKey");

  if (!!privateKey) {
    try {
      window.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: localStorage.getItem("githubAppId"),
          privateKey: localStorage.getItem("githubPrivateKey"),
          installationId: localStorage.getItem("githubAppInstallationId")
        },
      });

      console.log(`done: ${JSON.stringify(octokit)}`);
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }
}

function makePost(postAuthor, {postTitle, postTimestamp, postBody, postTagsRawString}) {
  const tagArray = postTagsRawString.split(',').map((t) => t.trim());

  return `---json
${JSON.stringify({
  author: postAuthor,
  date: "Git created",
  title: postTitle,
  timestamp: postTimestamp,
  tags: tagArray,
  layout: "layouts/post.njk"
})}
---
${postBody}
`;
}

window.addEventListener("DOMContentLoaded", async () => {
  authorize();

  const postButton = document.getElementById("postButton");
  const postTitleInput = document.getElementById("postTitleInput");
  const postBodyTextarea = document.getElementById("postBodyTextarea");
  const postTagsInput = document.getElementById("postTagsInput");

  postButton.addEventListener("click", async (e) => {
    e.preventDefault();

    window.currentPost = {
      postTitle: postTitleInput.value,
      postTimestamp: Date.now(),
      postBody: postBodyTextarea.value,
      postTagsRawString: postTagsInput.value
    }

    const eleventyFormattedPost = makePost(localStorage.getItem("postAuthor"), window.currentPost);

    if (octokit) {

      try {
        const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
          owner: localStorage.getItem("githubRepoOwner"),
          repo: localStorage.getItem("githubRepoName"),
          path: `content/${Date.now().toString()}.md`,
          message: "post created with octobug",
          content: window.btoa(eleventyFormattedPost),
          branch: "main"
        });

        console.log(response);
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
    } else {
      console.log("API not initialized");
    }
  });
});
