import { createAppAuth } from "https://esm.sh/@octokit/auth-app";
import { Octokit } from "https://esm.sh/@octokit/core";
import he from "https://esm.sh/he";

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

  const tagArray = []
  try {
    tagArray.push(...JSON.parse(postTagsRawString))
  } catch (e) {}
  
  return `---json
${JSON.stringify({
  author: he.encode(postAuthor),
  date: "Git created",
  title: he.encode(postTitle),
  timestamp: postTimestamp,
  tags: tagArray, // all items encoded above
  layout: "layouts/post.njk"
})}
---
${he.encode(postBody)}
`;
}

window.addEventListener("DOMContentLoaded", async () => {
  authorize();

  const postButton = document.getElementById("postButton");
  const postTitleInput = document.getElementById("postTitleInput");
  const postBodyTextarea = document.getElementById("postBodyTextarea");
  const postTagsInput = document.getElementById("postTagsHiddenInput");

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

        if (response.status == "201") {
          console.log("success!");
          Array.from(document.querySelectorAll("form")).forEach((el) => {
            el.reset();
          })
          const dataList = document.querySelector("datalist");
          while (dataList.firstChild) {
            dataList.removeChild(dataList.lastChild);
          }
        }
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
    } else {
      console.log("API not initialized");
    }
  });
});
