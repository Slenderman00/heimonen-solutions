class Post {
    constructor(title, description, data, tags, date) {
        this.title = title;
        this.description = description;
        this.data = data;
        this.tags = tags;
        this.date = date;
    }

    getHTML() {
        let blogPost = document.createElement("div");

        blogPost.className = "blog-item blog-content hoverable";

        let titleAndDate = document.createElement("div");
        titleAndDate.className = "index-item-title-and-date";

        let indexItemTitle = document.createElement("div");
        indexItemTitle.className = "index-item-title";
        indexItemTitle.innerHTML = this.title;

        let indexItemDescription = document.createElement("div");
        indexItemDescription.className = "index-item-description";
        indexItemDescription.innerHTML = this.description;

        //wtf is even javascript anymore
        indexItemDescription.dataset.originalContent = this.description;


        let titleDate = document.createElement("div");
        titleDate.className = "index-item-title-date";

        let date = new Date(this.date * 1000).toLocaleDateString("en-US", { day: '2-digit', year: 'numeric', month: 'long' });
        titleDate.innerHTML = date;

        titleAndDate.appendChild(indexItemTitle);
        titleAndDate.appendChild(titleDate);
        blogPost.appendChild(titleAndDate);
        blogPost.appendChild(indexItemDescription);

        if (this.tags.length > 0) {
            let indexItemTags = document.createElement("div");
            indexItemTags.className = "index-item-tags";

            for (let tag of this.tags) {
                let indexItemTag = document.createElement("div");
                indexItemTag.className = "index-item-tag";
                indexItemTag.innerHTML = tag;

                indexItemTags.appendChild(indexItemTag);
            }

            blogPost.appendChild(indexItemTags);
        }

        //scope transfer
        let data = this.data;
        let description = this.description;

        blogPost.onclick = function (event) {
            if (event.target.tagName === "BUTTON") {
                window.open(event.target.dataset.url, '_blank');
            }
        
            //if the current post is already expanded, do nothing
            if (blogPost.classList.contains("expanded")) {
                return;
            }
        
            //prevent the event from propagating to the body
            event.stopPropagation();
        
            //close any previously opened posts
            let expandedPosts = document.querySelectorAll(".blog-item.expanded");
        
            expandedPosts.forEach(function (post) {
                if (post !== blogPost) {
                    animateHeight(post, post.scrollHeight, 80, 500, () => {
                        post.classList.remove("expanded");
                        post.classList.add("hoverable");
                        let description = post.querySelector(".index-item-description");
                        description.innerHTML = description.dataset.originalContent;
                    });
                }
            });
        
            //toggle the expanded class on the clicked post
            if (blogPost.classList.contains("expanded")) {
                indexItemDescription.innerHTML = description;
                animateHeight(blogPost, blogPost.scrollHeight, 80, 500, () => {
                    blogPost.classList.remove("expanded");
                    blogPost.classList.add("hoverable");
                });
            } else {
                let startHeight = blogPost.scrollHeight;
                blogPost.style.height = startHeight + 'px';
                blogPost.classList.add("expanded");
                blogPost.classList.remove("hoverable");
                indexItemDescription.innerHTML = data;
                setTimeout(() => {
                    animateHeight(blogPost, 80, blogPost.scrollHeight, 500, () => {
                        blogPost.style.height = 'auto';
                    });
                }, 0);
            }

            MathJax.typesetPromise()
        };


        return blogPost;
    }
}

function animateHeight(element, startHeight, endHeight, duration, callback) {
    let startTime = null;

    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        let timeElapsed = currentTime - startTime;
        let run = ease(timeElapsed, startHeight, endHeight - startHeight, duration);
        element.style.height = run + 'px';
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            element.style.height = endHeight + 'px';
            if (callback) callback();
        }
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

class RichText {
    constructor(data, includes) {
        this.includes = includes
        this.data = data;
        this.mother = document.createElement("div");
    }

    parseItem(item, parent) {
        switch (item.nodeType) {
            case "text":
                //console.log(item.value);
                let text = document.createElement("span");

                //go trough item marks and check for underline, bold, italic, code
                for (let mark of item.marks) {
                    switch (mark.type) {
                        case "underline":
                            text.classList.add("underline");
                            break;
                        case "bold":
                            text.classList.add("bold");
                            break;
                        case "italic":
                            text.classList.add("italic");
                            break;
                        case "code":
                            text = document.createElement("pre");
                            text.classList.add("code");
                            break;
                    }
                }
                text.innerHTML = item.value;

                parent.appendChild(text);
                break;
            case "paragraph":
                let paragraph = document.createElement("P");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, paragraph);
                }
                parent.appendChild(paragraph);
                break;
            case "heading-1":
                let heading1 = document.createElement("h1");
                heading1.innerHTML = item.content[0].value;
                parent.appendChild(heading1);
                break;
            case "heading-2":
                let heading2 = document.createElement("h2");
                heading2.innerHTML = item.content[0].value;
                parent.appendChild(heading2);
                break;
            case "heading-3":
                let heading3 = document.createElement("h3");
                heading3.innerHTML = item.content[0].value;
                parent.appendChild(heading3);
                break;
            case "heading-4":
                let heading4 = document.createElement("h4");
                heading4.innerHTML = item.content[0].value;
                parent.appendChild(heading4);
                break;
            case "heading-5":
                let heading5 = document.createElement("h5");
                heading5.innerHTML = item.content[0].value;
                parent.appendChild(heading5);
                break;
            case "heading-6":
                let heading6 = document.createElement("h6");
                heading6.innerHTML = item.content[0].value;
                parent.appendChild(heading6);
                break;
            case "unordered-list":
                let unorderedList = document.createElement("ul");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, unorderedList);
                }
                parent.appendChild(unorderedList);
                break;
            case "ordered-list":
                let orderedList = document.createElement("ol");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, orderedList);
                }
                parent.appendChild(orderedList);
                break;
            case "list-item":
                let listItem = document.createElement("li");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, listItem);
                }
                parent.appendChild(listItem);
                break;
            case "hyperlink":
                let hyperlink = document.createElement("a");
                hyperlink.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" height="0.8em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"/></svg>';
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, hyperlink);
                }
                hyperlink.href = item.data.uri;
                parent.appendChild(hyperlink);
                break;
            case "embedded-asset-block":
                let asset = this.includes.Asset.find(asset => asset.sys.id === item.data.target.sys.id);
                if (asset && asset.fields.file.contentType.includes('image')) {
                    let image = document.createElement("img");
                    image.src = "https:" + asset.fields.file.url;
                    image.style.maxWidth = "100%";
                    image.style.height = "auto";
                    image.id = item.data.id;
                    parent.appendChild(image);
                } else if (asset && asset.fields.file.contentType.includes('video')) {
                    let video = document.createElement("video");
                    video.controls = true;
                    let source = document.createElement("source");
                    source.src = "https:" + asset.fields.file.url;
                    source.type = asset.fields.file.contentType;
                    video.appendChild(source);
                    video.style.maxWidth = "100%";
                    video.style.height = "auto";
                    video.id = item.data.id;
                    parent.appendChild(video);
                } else if (asset && asset.fields.file.contentType.includes('application/pdf')) {
                    let button = document.createElement("button");
                    
                    // Get PDF title from asset fields
                    const pdfTitle = asset.fields.title || "View PDF";
                    
                    button.className = 'pdf-button';
                    button.innerHTML = `
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,19.1C6.43,18.5 7.87,16.64 7.87,16.64C8.5,15.55 9.42,14.03 9.42,14.03C10.39,13.11 10.92,12.31 10.92,12.31M11.97,13.34C11.67,12.96 11.63,11.76 11.63,11.76C11.63,11.76 11.51,10.97 12,11.24C12.57,11.57 12.07,12.53 11.97,13.34M13.97,15.06C13.97,15.06 15.5,15.81 15.77,15.45C16.04,15.09 13.94,15.06 13.97,15.06M8.65,17.17C8.65,17.17 8.2,17.54 8.37,17.84C8.54,18.14 9.37,16.95 8.65,17.17M10.32,15.45C10.32,15.45 11.2,15.11 12.23,15.06C11.61,14.76 10.8,14.43 10.32,15.45Z"/>
                        </svg>
                        ${pdfTitle}
                    `;
                    
                
                    button.dataset.url = "https:" + asset.fields.file.url;
                    parent.appendChild(button);
                }
                break;
            case "blockquote":
                let blockquote = document.createElement("blockquote");
                for (let subItem of item.content) {
                    //console.log(subItem);
                    this.parseItem(subItem, blockquote);
                }
                parent.appendChild(blockquote);
                break;
            case "hr":
                let hr = document.createElement("hr");
                parent.appendChild(hr);
                break;
            default:
                console.log(item);
                break;
        }
    }

    parse() {
        for (let item of this.data) {
            this.parseItem(item, this.mother);
        }
        //console.log(this.data);
        return this.mother.innerHTML;
    }
}

let addPosts = (container) => {
    let posts = [];

    //fetch posts https://cdn.contentful.com/spaces/{space_id}/environments/{environment_id}/entries?access_token={access_token}
    fetch("https://cdn.contentful.com/spaces/030xzm76gl6f/environments/master/entries?access_token=2qct9J11QIyz6eGjuZTY5arti-xqpvC8803H0PvfTyE").then(function (response) {
        return response.json();
    }).then(function (json) {

        console.log(json);
        for (let item of json.items) {
            let title = item.fields.title;
            let description = item.fields.description;
            //data is rtf so we need to parse it
            rtf = new RichText(item.fields.content.content, json.includes);
            let data = rtf.parse();

            let tags = item.fields.tags;

            let date = new Date(item.sys.createdAt).getTime() / 1000;

            posts.push(new Post(title, description, data, tags, date));
        }
        posts.sort(function (a, b) {
            return b.date - a.date;
        });

        for (let post of posts) {
            container.appendChild(post.getHTML());
        }
    });
}

let addPreview = (container, key, callback) => {
    let posts = [];

    //fetch posts https://cdn.contentful.com/spaces/{space_id}/environments/{environment_id}/entries?access_token={access_token}
    fetch(`https://preview.contentful.com/spaces/030xzm76gl6f/environments/master/entries?access_token=${key}`).then(function (response) {
        return response.json();
    }).then(function (json) {

        console.log(json);
        for (let item of json.items) {
            try {
                let title = item.fields.title;
                let description = item.fields.description;
                //data is rtf so we need to parse it
                rtf = new RichText(item.fields.content.content, json.includes);
                let data = rtf.parse();

                let tags = item.fields.tags;

                let date = new Date(item.sys.createdAt).getTime() / 1000;

                posts.push(new Post(title, description, data, tags, date));
            } catch {}
        }

        posts.sort(function (a, b) {
            return b.date - a.date;
        });

        for (let post of posts) {
            container.appendChild(post.getHTML());
        }

        callback()
    });
}

let pollContentful = (key) => {
    let lastPosts = JSON.parse(localStorage.getItem('lastPosts')) || [];
  
    const checkForChanges = () => {
      if (lastPosts.length === 0) return;
  
      fetch(`https://preview.contentful.com/spaces/030xzm76gl6f/environments/master/entries?access_token=${key}`)
        .then(response => response.json())
        .then(json => {
          let currentPosts = json.items.map(item => ({
            id: item.sys.id,
            title: item.fields.title,
            description: item.fields.description,
            date: item.sys.createdAt,
          }));
  
          console.log(JSON.stringify(currentPosts) !== JSON.stringify(lastPosts));
          if (JSON.stringify(currentPosts) !== JSON.stringify(lastPosts)) {
            lastPosts = currentPosts;
            localStorage.setItem('lastPosts', JSON.stringify(lastPosts));
  
            location.reload();
          }
        })
        .catch(error => {
          console.error('Error fetching Contentful posts:', error);
        });
    };
  
    setInterval(checkForChanges, 1000);
  };
  
  