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

function makePost(
  postAuthor,
  { postTitle, postTimestamp, postBody, postTagsRawString }
) {
  const tagArray = [];
  try {
    tagArray.push(...JSON.parse(postTagsRawString));
  } catch (e) {
    console.log("problem trying to parse tags");
  }

  return `---json
${JSON.stringify({
  author: he.encode(postAuthor),
  date: "Git created",
  title: he.encode(postTitle),
  timestamp: postTimestamp,
  tags: tagArray, // all items encoded above
  layout: "layouts/post.njk",
})}
---
${he.encode(postBody)}
`;
}

function encodeTextForGithub(text) {
  const encodedBytes = new TextEncoder().encode(text);
  const binaryString = String.fromCodePoint(...encodedBytes);
  return btoa(binaryString);
}

window.addEventListener("DOMContentLoaded", async () => {
  authorize();

  const postButton = document.getElementById("postButton");
  const postTitleInput = document.getElementById("postTitleInput");
  const postBodyTextarea = document.getElementById("postBodyTextarea");
  const postTagsHiddenInput = document.getElementById("postTagsHiddenInput");

  postButton.addEventListener("click", async (e) => {
    e.preventDefault();

    window.currentPost = {
      postTitle: postTitleInput.value,
      postTimestamp: Date.now(),
      postBody: postBodyTextarea.value,
      postTagsRawString: postTagsHiddenInput.value,
    };

    const eleventyFormattedPost = makePost(
      localStorage.getItem("postAuthor"),
      window.currentPost
    );

    if (octokit) {
      try {
        const response = await octokit.request(
          "PUT /repos/{owner}/{repo}/contents/{path}",
          {
            owner: localStorage.getItem("githubRepoOwner"),
            repo: localStorage.getItem("githubRepoName"),
            path: `content/post/${Date.now().toString()}.md`,
            message: "post created with octobug",
            content: encodeTextForGithub(eleventyFormattedPost),
            branch: "main",
          }
        );

        if (response.status == "201") {
          console.log("success!");
          Array.from(document.querySelectorAll("form")).forEach((el) => {
            el.reset();
          });
          const tagsDisplay = document.querySelector("taggedList");
          while (tagsDisplay.firstChild) {
            tagsDisplay.removeChild(tagsDisplay.lastChild);
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
