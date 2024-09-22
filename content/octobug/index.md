---
  eleventyExcludeFromCollections: true
  layout: "layouts/home.njk"
  title: "Octobug: Post"
---

    <h1>Post</h1>
    <form id="post">
      <label for="postTitle">Title</label>
      <input type="text" id="postTitle"/>
      <label for="postBody">Body</label>
      <textarea rows="10" id="postBody"></textarea>
      <label for="postTagsRaw">Tags (comma separated)</label>
      <input type="text" id="postTagsRaw"/>
      <button id="postButton" type="submit">POST!</button>
    </form>

{% jstags %}

  <script type="module" href="/octobug/main.mjs"></script>

{% endjstags %}
