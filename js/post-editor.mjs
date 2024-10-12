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
          installationId: localStorage.getItem("githubAppInstallationId"),
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
    tagArray.push(
      ...JSON.parse(decodeURIComponent(postTagsRawString) || "[]").map((tag) =>
        he.encode(tag)
      )
    );
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

async function encodeBinaryForGithub(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  authorize();

  const postButton = document.getElementById("postButton");
  const postTitleInput = document.getElementById("postTitleInput");
  const postBodyTextarea = document.getElementById("postBodyTextarea");
  const postTagsHiddenInput = document.getElementById("postTagsHiddenInput");

  const uploadAttachmentInput = document.getElementById(
    "uploadAttachmentInput"
  );

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
          const tagsDisplay = document.getElementById("taggedList");
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

  uploadAttachmentInput.addEventListener("change", async (e) => {
    for (const file of e.target.files) {
      const now = new Date();

      const urlPrefixNoFilename = `attachments/${now.getUTCFullYear()}/${
        now.getUTCMonth() + 1
      }/${now.getUTCDate()}`;
      const url = `${urlPrefixNoFilename}/${file.name}`;
      const encodedFilenameUrl = `${urlPrefixNoFilename}/${encodeURIComponent(
        file.name
      )}`;

      const encodedFile = await encodeBinaryForGithub(file);
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: localStorage.getItem("githubRepoOwner"),
        repo: localStorage.getItem("githubRepoName"),
        path: `public/${url}`,
        message: "attachment uploaded with octobug",
        content: encodedFile.replace(/data:.+base64,/, ""),
        branch: "main",
      });

      postBodyTextarea.value += `\n![${file.name}](/${encodedFilenameUrl})`;
    }

    uploadAttachmentInput.value = "";
  });
});
