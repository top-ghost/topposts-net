---
  eleventyExcludeFromCollections: true
  layout: "layouts/home.njk"
  title: "Octobug: Post"
---

<form id="submitForm" class="post">
    <h1 class="title">
        <input type="text" id="postTitleInput" placeholder="headline" />
    </h1>
    <div class="postbody">
      <textarea rows="10" id="postBodyTextarea" placeholder="post body (accepts markdown!)"></textarea>
    </div>
    <div class="tags">
      <input type="text" id="postTagsInput" placeholder="#add tags" list="all-tags"/>
      <div id="taggedList"></div>
      <input
        type="hidden"
        id="postTagsHiddenInput"
        name="tags"
        value=""
      />
    </div>
    <div class="controls">
        <input type="file" id="uploadAttachmentInput"/>
        <label for="uploadAttachmentInput">⤴️</label>
        <button id="postButton" type="submit">post now</button>
    </div>
</form>

<datalist id="all-tags">
</datalist>

{% jstags %}

  <script type="module" src="/js/post-editor.mjs"></script>
  <script type="module" src="/js/tag-autocomplete.mjs"></script>

{% endjstags %}
