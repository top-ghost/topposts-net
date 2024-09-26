---
  eleventyExcludeFromCollections: true
  title: "Octobug: Settings"
  layout: "layouts/home.njk"
---

    <h1>Secrets</h1>
    <form id="secrets">
      <label for="githubPrivateKeyInput">Private Key (one-line, PKCS8 format)</label>
      <input type="text" id="githubPrivateKeyInput"/>
      <label for="githubAppIdInput">Github App ID</label>
      <input type="text" id="githubAppIdInput"/>
      <label for="githubAppInstallationIdInput">Github App Installation ID</label>
      <input type="text" id="githubAppInstallationIdInput"/>
      <label for="githubRepoUrlInput">Github Repo URL (<code>https://github.com/${owner}/${repo}</code>)</label>
      <input type="text" id="githubRepoUrlInput"/>
      <label for="postAuthorInput">Post Author Name</label>
      <input type="text" id="postAuthorInput"/>
      <button type="submit" id="secretsUpdateButton">UPDATE!</button>
    </form>

{% jstags %}

  <script type="module" src="/js/secrets.mjs"></script>

{% endjstags %}
