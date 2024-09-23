---
  eleventyExcludeFromCollections: true
  layout: "layouts/home.njk"
  title: "Octobug: Post"
---

<div class="post">
    <h1 class="title">
        <input type="text" id="postTitleInput" placeholder="headline" />
    </h1>
    <div class="postbody">
      <textarea rows="10" id="postBodyTextarea" placeholder="post body (accepts markdown!)"></textarea>
    </div>
    <div class="tags">
      <input type="text" id="postTagsInput" placeholder="#add tags"/>
    </div>
    <div class="controls">
      <button id="postButton" type="submit">post now</button>
    </div>
</div>

{% jstags %}

  <script type="module" src="/octobug/main.mjs"></script>

{% endjstags %}
